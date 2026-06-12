import uuid
from datetime import UTC, datetime
from time import perf_counter
from typing import Any, Optional

import lm_eval
from lm_eval.tasks import TaskManager
from sqlmodel import Session

from app.db.session import engine
from app.domains.evaluations.errors import EvaluationNotFoundError
from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
)
from app.domains.evaluations.repository import EvaluationRepository
from app.domains.evaluations.schemas import EvaluationCreate
from app.domains.llms.errors import LLMNotFoundError


def run_evaluation_background_task(
    evaluation_id: uuid.UUID,
    model_name: str,
    limit: int,
) -> None:
    with Session(engine) as session:
        service = EvaluationService(EvaluationRepository(session))
        service.start_evaluation(evaluation_id, model_name, limit)


class EvaluationService:
    def __init__(self, repository: EvaluationRepository) -> None:
        self.repository = repository

    def list_evaluations(
        self, offset: int = 0, limit: int = 10
    ) -> list[EvaluationModel]:
        return self.repository.list_evaluations(offset=offset, limit=limit)
        

    def get_evaluation(self, evaluation_id: uuid.UUID) -> EvaluationModel:
        evaluation = self.repository.get_by_id(evaluation_id)

        if evaluation is None:
            raise EvaluationNotFoundError(evaluation_id)

        return evaluation

    def start_evaluation(
        self, llm_id: uuid.UUID, evaluation_create: EvaluationCreate
    ) -> EvaluationModel:
        
        # Initialise evaluation entry in database
        evaluation = EvaluationModel(
            llm_id=llm_id,
            metadata_entry=EvaluationMetadata(),
            benchmarks=[
                BenchmarkModel(name=benchmark.name, description=benchmark.description)
                for benchmark in evaluation_create.benchmarks
            ],
        )

        self.repository.create_evaluation(evaluation)

        # Run evaluation and update database entry with results
        meta = evaluation.metadata_entry

        started_at = perf_counter()
        meta.evaluation_status = EvaluationStatus.RUNNING
        for benchmark in evaluation.benchmarks:
            benchmark.status = EvaluationStatus.RUNNING
        self.repository.save_evaluation(evaluation)

        try:
            results = self._run_lm_eval(
                base_url=evaluation_create.model_endpoint,
                model_name=evaluation_create.model_name,
                tasks=[benchmark.name for benchmark in evaluation.benchmarks],
            )
        except Exception:
            meta.evaluation_status = EvaluationStatus.FAILED
            for benchmark in evaluation.benchmarks:
                benchmark.status = EvaluationStatus.FAILED
        else:
            meta.evaluation_status = EvaluationStatus.COMPLETED
            meta.progress = 100.0
            for benchmark in evaluation.benchmarks:
                benchmark_result = results.get(benchmark.name, {})
                benchmark.status = EvaluationStatus.COMPLETED
                benchmark.score = self._extract_score(benchmark_result)
                benchmark.progress = 100.0

        meta.duration = perf_counter() - started_at
        meta.completed_at = datetime.now(UTC)
        meta.progress = 100.0
        return self.repository.save_evaluation(evaluation)


    def _run_lm_eval(
        self,
        base_url: str,
        model_name: str,
        tasks: list[str],
    ) -> dict[str, dict[str, Any]]:
        evaluation_results = lm_eval.simple_evaluate(
            model="local-chat-completions",
            model_args={"model": model_name, "base_url": base_url},
            tasks=tasks,
            task_manager=TaskManager(),
            apply_chat_template=True,
        )

        if evaluation_results is None:
            return {}

        if isinstance(evaluation_results, dict):
            return evaluation_results.get("results", {})

        return getattr(evaluation_results, "results", {})

    def _extract_score(self, benchmark_result: dict[str, Any]) -> float | None:
        for metric_name, value in benchmark_result.items():
            if metric_name.endswith("_stderr"):
                continue
            if isinstance(value, int | float):
                return float(value)
        return None