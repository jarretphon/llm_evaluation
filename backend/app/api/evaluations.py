import uuid

from fastapi import APIRouter, HTTPException, status

from app.domains.evaluations.dependencies import EvaluationServiceDep
from app.domains.evaluations.errors import EvaluationNotFoundError
from app.domains.evaluations.schemas import EvaluationCreate

router = APIRouter()


@router.get("")
def get_all_evaluations(
    evaluation_service: EvaluationServiceDep, offset: int = 0, limit: int = 10
):
    return evaluation_service.list_evaluations(offset=offset, limit=limit)


@router.get("/{evaluation_id}")
def get_evaluation(evaluation_id: uuid.UUID, service: EvaluationServiceDep):
    try:
        return service.get_evaluation(evaluation_id)
    except EvaluationNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/start")
def create_evaluation(
    llm_id: uuid.UUID,
    evaluation_create: EvaluationCreate,
    service: EvaluationServiceDep,
):
    return service.start_evaluation(llm_id, evaluation_create)
