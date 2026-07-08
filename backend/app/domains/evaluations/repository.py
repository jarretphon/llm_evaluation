import uuid

from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
)
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select


class EvaluationRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_evaluations(
        self, offset: int = 0, limit: int = 10
    ) -> list[EvaluationModel]:
        statement = (
            select(EvaluationModel)
            .options(
                selectinload(EvaluationModel.metadata_entry),
                selectinload(EvaluationModel.benchmarks).selectinload(
                    BenchmarkModel.metrics
                ),
            )
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_by_id(self, id: uuid.UUID) -> EvaluationModel | None:
        statement = (
            select(EvaluationModel)
            .where(EvaluationModel.id == id)
            .options(
                selectinload(EvaluationModel.metadata_entry),
                selectinload(EvaluationModel.benchmarks).selectinload(
                    BenchmarkModel.metrics
                ),
            )
        )
        return self.session.exec(statement).first()

    def create_evaluation(self, evaluation: EvaluationModel) -> EvaluationModel:
        self.session.add(evaluation)
        self.session.commit()
        self.session.refresh(evaluation)

        return evaluation

    def save_evaluation(self, evaluation: EvaluationModel) -> EvaluationModel:
        self.session.commit()
        self.session.refresh(evaluation)

        return evaluation

    def update_evaluation(
        self, evaluation: EvaluationModel, **kwargs
    ) -> EvaluationModel:
        for key, value in kwargs.items():
            if hasattr(evaluation, key):
                setattr(evaluation, key, value)
            else:
                raise AttributeError(f"EvaluationModel has no attribute '{key}'")

        self.session.add(evaluation)
        return evaluation

    def update_evaluation_metadata(
        self, metadata: EvaluationMetadata, **kwargs
    ) -> EvaluationMetadata:
        for key, value in kwargs.items():
            if hasattr(metadata, key):
                setattr(metadata, key, value)
            else:
                raise AttributeError(f"EvaluationMetadata has no attribute '{key}'")

        self.session.add(metadata)
        return metadata

    def update_benchmark(self, benchmark: BenchmarkModel, **kwargs) -> BenchmarkModel:
        for key, value in kwargs.items():
            if hasattr(benchmark, key):
                setattr(benchmark, key, value)
            else:
                raise AttributeError(f"BenchmarkModel has no attribute '{key}'")

        self.session.add(benchmark)
        return benchmark
