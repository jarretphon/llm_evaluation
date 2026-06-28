import uuid

from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.domains.evaluations.models import (
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
)
from app.domains.llms.models import LLMModel


class ComparisonRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_models_by_ids(self, model_ids: list[uuid.UUID]) -> list[LLMModel]:
        if not model_ids:
            return []

        statement = select(LLMModel).where(LLMModel.id.in_(model_ids))
        return list(self.session.exec(statement).all())

    def list_completed_evaluations_for_models(
        self, model_ids: list[uuid.UUID]
    ) -> list[EvaluationModel]:
        if not model_ids:
            return []

        statement = (
            select(EvaluationModel)
            .join(
                EvaluationMetadata,
                EvaluationMetadata.evaluation_id == EvaluationModel.id,
            )
            .where(
                EvaluationModel.llm_id.in_(model_ids),
                EvaluationModel.status == EvaluationStatus.COMPLETED,
            )
            .options(
                selectinload(EvaluationModel.metadata_entry),
                selectinload(EvaluationModel.benchmarks),
            )
            .order_by(
                EvaluationModel.llm_id,
                EvaluationMetadata.completed_at.desc().nullslast(),
                EvaluationMetadata.started_at.desc(),
            )
        )
        return list(self.session.exec(statement).all())
