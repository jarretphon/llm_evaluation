import uuid
from collections.abc import AsyncIterator
from contextlib import suppress

import aio_pika
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.sse import EventSourceResponse, ServerSentEvent

from app.domains.evaluations.dependencies import EvaluationServiceDep
from app.domains.evaluations.errors import (
    EvaluationNotFoundError,
    NoBenchmarksSelectedError,
)
from app.domains.evaluations.notifications import (
    EVALUATION_UPDATES_EXCHANGE,
    EVALUATION_UPDATES_ROUTING_KEY,
)
from app.domains.evaluations.schemas import EvaluationCreate, EvaluationRead
from app.domains.evaluations.tasks import run_evaluation_task
from app.domains.llms.errors import LLMNotFoundError

router = APIRouter()


@router.get("/benchmarks")
def get_benchmark_options(service: EvaluationServiceDep) -> dict[str, list[str]]:
    return service.list_benchmark_options()


@router.get("")
def get_all_evaluations(
    evaluation_service: EvaluationServiceDep, offset: int = 0, limit: int = 10
) -> list[EvaluationRead]:
    return evaluation_service.list_evaluations(offset=offset, limit=limit)


@router.get("/events", response_class=EventSourceResponse)
async def get_evaluation_events(
    request: Request,
) -> AsyncIterator[ServerSentEvent]:
    connection = request.app.state.amqp_connection
    channel = await connection.channel()
    exchange = await channel.declare_exchange(
        EVALUATION_UPDATES_EXCHANGE, aio_pika.ExchangeType.TOPIC
    )
    queue = await channel.declare_queue(exclusive=True, auto_delete=True)
    await queue.bind(exchange, routing_key=EVALUATION_UPDATES_ROUTING_KEY)

    try:
        async with queue.iterator() as queue_iterator:
            async for message in queue_iterator:
                if await request.is_disconnected():
                    break

                async with message.process():
                    yield ServerSentEvent(
                        event="evaluation_update",
                        raw_data=message.body.decode(),
                    )
    finally:
        with suppress(Exception):
            await channel.close()


@router.get("/{evaluation_id}")
def get_evaluation(
    evaluation_id: uuid.UUID, service: EvaluationServiceDep
) -> EvaluationRead:
    try:
        return service.get_evaluation(evaluation_id)
    except EvaluationNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("")
def create_evaluation(
    evaluationCreate: EvaluationCreate, service: EvaluationServiceDep
) -> EvaluationRead:
    try:
        evaluation = service.create_evaluation(evaluationCreate)
        run_evaluation_task.delay(evaluation.id)
    except LLMNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NoBenchmarksSelectedError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except EvaluationNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create evaluation. Error: {e}",
        )

    return evaluation
