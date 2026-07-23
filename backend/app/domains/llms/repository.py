import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, time, timedelta

from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
)
from app.domains.llms.models import LLMModel
from app.domains.llms.schemas import LLMCreate, LLMUpdate
from sqlalchemy import func
from sqlmodel import Session, select


@dataclass(frozen=True)
class ModelSummaryCounts:
    total_models: int
    provider_count: int
    active_evaluations: int
    running_benchmarks: int
    completed_today: int
    queued_evaluations: int
    needs_attention: int


class LLMRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_llms(self, offset: int = 0, limit: int = 10) -> list[LLMModel]:
        statement = (
            select(LLMModel)
            .order_by(LLMModel.added_at.desc(), LLMModel.id)
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_by_id(self, id: uuid.UUID) -> LLMModel | None:
        statement = select(LLMModel).where(LLMModel.id == id)
        return self.session.exec(statement).first()

    def get_by_name(self, name: str) -> LLMModel | None:
        statement = select(LLMModel).where(LLMModel.name == name)
        return self.session.exec(statement).first()

    def get_model_summary_counts(self) -> ModelSummaryCounts:
        start_of_today = datetime.combine(
            datetime.now(UTC).date(), time.min, tzinfo=UTC
        )
        start_of_tomorrow = start_of_today + timedelta(days=1)

        return ModelSummaryCounts(
            total_models=self._count(select(func.count(LLMModel.id))),
            provider_count=self._count(
                select(func.count(func.distinct(LLMModel.provider)))
            ),
            active_evaluations=self._count(
                select(func.count(EvaluationModel.id)).where(
                    EvaluationModel.status == EvaluationStatus.RUNNING
                )
            ),
            running_benchmarks=self._count(
                select(func.count(BenchmarkModel.id)).where(
                    BenchmarkModel.status == EvaluationStatus.RUNNING
                )
            ),
            completed_today=self._count(
                select(func.count(EvaluationModel.id))
                .join(EvaluationMetadata)
                .where(
                    EvaluationModel.status == EvaluationStatus.COMPLETED,
                    EvaluationMetadata.completed_at >= start_of_today,
                    EvaluationMetadata.completed_at < start_of_tomorrow,
                )
            ),
            queued_evaluations=self._count(
                select(func.count(EvaluationModel.id)).where(
                    EvaluationModel.status == EvaluationStatus.QUEUED
                )
            ),
            needs_attention=self._count(
                select(func.count(EvaluationModel.id)).where(
                    EvaluationModel.status.in_(
                        [
                            EvaluationStatus.FAILED,
                            EvaluationStatus.PARTIAL_FAILED,
                        ]
                    )
                )
            ),
        )

    def create_llm(self, llm_create: LLMCreate) -> LLMModel:
        llm = LLMModel.model_validate(llm_create)

        self.session.add(llm)
        self.session.commit()
        self.session.refresh(llm)

        return llm

    def _count(self, statement) -> int:
        return self.session.exec(statement).one()

    def delete_llm(self, llm_db_entry: LLMModel) -> None:
        self.session.delete(llm_db_entry)
        self.session.commit()

    def edit_llm(self, llm_db_entry: LLMModel, llm_update: LLMUpdate) -> LLMModel:

        changes = llm_update.model_dump(exclude_unset=True)
        print(changes)
        for key, value in changes.items():
            setattr(llm_db_entry, key, value)

        self.session.add(llm_db_entry)
        self.session.commit()
        self.session.refresh(llm_db_entry)

        return llm_db_entry
