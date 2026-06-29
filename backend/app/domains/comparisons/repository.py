import uuid
from dataclasses import dataclass

from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
    MetricModel,
)
from app.domains.llms.models import LLMModel
from sqlalchemy import desc, func
from sqlmodel import Session, select


@dataclass(frozen=True)
class ComparisonMetricRow:
    model_id: uuid.UUID
    model_name: str
    evaluation_id: uuid.UUID
    benchmark_name: str
    metric_name: str
    value: float


class ComparisonRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_models_by_ids(self, model_ids: list[uuid.UUID]) -> list[LLMModel]:
        if not model_ids:
            return []

        statement = select(LLMModel).where(LLMModel.id.in_(model_ids))
        return list(self.session.exec(statement).all())

    def list_latest_evaluation_metric_rows(
        self, model_ids: list[uuid.UUID]
    ) -> list[ComparisonMetricRow]:
        if not model_ids:
            return []

        # Fetch the latest completed evaluation for each requested model
        ordered_evaluations = (
            select(
                EvaluationModel.id.label("evaluation_id"),
                func.row_number()
                .over(
                    partition_by=EvaluationModel.llm_id,
                    order_by=(
                        EvaluationMetadata.completed_at.desc().nullslast(),
                        EvaluationMetadata.started_at.desc(),
                    ),
                )
                .label("rank"),
            )
            .where(
                EvaluationModel.llm_id.in_(model_ids),
                EvaluationModel.status == EvaluationStatus.COMPLETED,
            )
            .subquery()
        )

        # Fetch the metrics for the latest completed evaluations
        # Metrics are ordered by benchmark name, metric name, and value (descending)
        statement = (
            select(
                LLMModel.id,
                LLMModel.name,
                EvaluationModel.id,
                BenchmarkModel.name,
                MetricModel.name,
                MetricModel.value,
            )
            .join(
                ordered_evaluations,
                ordered_evaluations.c.evaluation_id == EvaluationModel.id,
            )
            .join(LLMModel, LLMModel.id == EvaluationModel.llm_id)
            .join(BenchmarkModel, BenchmarkModel.evaluation_id == EvaluationModel.id)
            .join(MetricModel, MetricModel.benchmark_id == BenchmarkModel.id)
            .where(
                ordered_evaluations.c.rank == 1,
                MetricModel.value.is_not(None),
            )
            .order_by(
                BenchmarkModel.name,
                MetricModel.name,
                desc(MetricModel.value),
            )
        )

        return [
            ComparisonMetricRow(
                model_id=model_id,
                model_name=model_name,
                evaluation_id=evaluation_id,
                benchmark_name=benchmark_name,
                metric_name=metric_name,
                value=value,
            )
            for (
                model_id,
                model_name,
                evaluation_id,
                benchmark_name,
                metric_name,
                value,
            ) in self.session.exec(statement).all()
        ]
