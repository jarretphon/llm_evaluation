import uuid

from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
)
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.evaluations.schemas import EvaluationCreate


class EvaluationService:
    def __init__(self, repository: EvaluationRepository) -> None:
        self.repository = repository

    def list_evaluations(
        self, offset: int = 0, limit: int = 10
    ) -> list[EvaluationModel]:
        return self.repository.list_evaluations(offset=offset, limit=limit)

    def get_evaluation(self, evaluation_id: str) -> EvaluationModel:
        return self.repository.get_by_id(evaluation_id)

    def start_evaluation(
        self, llm_id: uuid.UUID, evaluation_create: EvaluationCreate
    ) -> EvaluationModel:

        evaluation_metadata = EvaluationMetadata()
        benchmarks = [
            BenchmarkModel(
                name=benchmark.name,
                description=benchmark.description,
            )
            for benchmark in evaluation_create.benchmarks
        ]

        evaluation_entry = EvaluationModel(
            llm_id=llm_id,
            metadata=evaluation_metadata,
            benchmarks=benchmarks,
        )

        return self.repository.create_evaluation(evaluation_entry)
