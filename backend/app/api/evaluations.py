import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.domains.evaluations.dependencies import EvaluationServiceDep
from app.domains.evaluations.errors import EvaluationNotFoundError
from app.domains.evaluations.schemas import EvaluationCreate, EvaluationRead
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
    evaluation_create: EvaluationCreate,
    service: EvaluationServiceDep,
    background_tasks: BackgroundTasks,
) -> EvaluationRead:
    try:
        evaluation = service.create_evaluation(evaluation_create)
    except LLMNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    background_tasks.add_task(service.start_evaluation, evaluation, evaluation_create)

    return evaluation
