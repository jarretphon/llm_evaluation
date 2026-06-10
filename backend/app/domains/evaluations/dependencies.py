from typing import Annotated

from app.db.session import SessionDep
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.evaluations.service import EvaluationService
from fastapi import Depends


def get_evaluation_service(session: SessionDep) -> EvaluationService:
    repository = EvaluationRepository(session)
    return EvaluationService(repository)


EvaluationServiceDep = Annotated[EvaluationService, Depends(get_evaluation_service)]
