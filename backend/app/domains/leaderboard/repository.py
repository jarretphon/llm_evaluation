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
from sqlalchemy import case, func
from sqlmodel import Session, select

METRIC_PRIORITY = ("acc", "acc_norm", "exact_match")


@dataclass(frozen=True)
class LeaderboardBenchmarkScore:
    benchmark_name: str
    metric_name: str
    value: float
    effective_sample_count: int


@dataclass(frozen=True)
class LeaderboardModelRow:
    model_id: uuid.UUID
    model_name: str
    provider: str
    weighted_average: float | None
    completed_benchmark_count: int
    selected_benchmark_count: int
    scores: dict[str, LeaderboardBenchmarkScore]


class LeaderboardRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

        # Creates a SQL case statement to rank metrics based on the order defined in METRIC_PRIORITY.
        self.metric_priority = case(
            *(
                (MetricModel.name == metric_name, priority)
                for priority, metric_name in enumerate(METRIC_PRIORITY, start=1)
            ),
            else_=len(METRIC_PRIORITY) + 1,
        )

    def get_leaderboard_rows(
        self, benchmark_names: list[str]
    ) -> list[LeaderboardModelRow]:
        if not benchmark_names:
            return []

        score_rows = self._get_priority_score_rows(benchmark_names)
        scores_by_model = self._group_scores_by_model(score_rows)

        statement = self._get_model_summary_statement(benchmark_names)

        return [
            LeaderboardModelRow(
                model_id=model_id,
                model_name=model_name,
                provider=provider,
                weighted_average=self._round_score(weighted_average),
                completed_benchmark_count=completed_benchmark_count,
                selected_benchmark_count=len(benchmark_names),
                scores=scores_by_model.get(model_id, {}),
            )
            for (
                model_id,
                model_name,
                provider,
                weighted_average,
                completed_benchmark_count,
            ) in self.session.exec(statement).all()
        ]

    def _get_priority_score_rows(
        self, benchmark_names: list[str]
    ) -> list[tuple[uuid.UUID, str, str, float, int]]:
        priority_scores = self._get_priority_score_subquery(benchmark_names)

        statement = (
            select(
                priority_scores.c.model_id,
                priority_scores.c.benchmark_name,
                priority_scores.c.metric_name,
                priority_scores.c.value,
                priority_scores.c.effective_sample_count,
            )
            .where(priority_scores.c.metric_rank == 1)
            .order_by(priority_scores.c.model_id, priority_scores.c.benchmark_name)
        )

        return list(self.session.exec(statement).all())

    def _get_model_summary_statement(self, benchmark_names: list[str]):
        priority_scores = self._get_priority_score_subquery(benchmark_names)
        selected_scores = (
            select(
                priority_scores.c.model_id,
                priority_scores.c.benchmark_name,
                priority_scores.c.value,
                priority_scores.c.effective_sample_count,
            )
            .where(priority_scores.c.metric_rank == 1)
            .subquery()
        )
        completed_benchmark_count = func.count(selected_scores.c.benchmark_name).label(
            "completed_benchmark_count"
        )
        weighted_average = (
            func.sum(selected_scores.c.value * selected_scores.c.effective_sample_count)
            / func.nullif(
                func.sum(selected_scores.c.effective_sample_count),
                0,
            )
        ).label("weighted_average")
        score_summary = (
            select(
                selected_scores.c.model_id,
                weighted_average,
                completed_benchmark_count,
            )
            .group_by(selected_scores.c.model_id)
            .subquery()
        )
        completed_count = func.coalesce(score_summary.c.completed_benchmark_count, 0)
        complete_models_first = case(
            (completed_count == len(benchmark_names), 0),
            else_=1,
        )
        complete_model_score = case(
            (
                completed_count == len(benchmark_names),
                score_summary.c.weighted_average,
            ),
            else_=None,
        )

        return (
            select(
                LLMModel.id,
                LLMModel.name,
                LLMModel.provider,
                score_summary.c.weighted_average,
                completed_count,
            )
            .outerjoin(score_summary, score_summary.c.model_id == LLMModel.id)
            .order_by(
                complete_models_first,
                complete_model_score.desc().nullslast(),
                completed_count.desc(),
                score_summary.c.weighted_average.desc().nullslast(),
                LLMModel.name,
            )
        )

    def _get_priority_score_subquery(self, benchmark_names: list[str]):
        """
        Constructs a subquery that isolates and prioritizes benchmark metrics for the
        latest completed evaluation of each language model.

        This function executes a two-stage SQL window filter:
        1. It identifies the newest successfully completed evaluation run
           for every individual LLM.
        2. Within those specific runs, it ranks all available recorded metrics for each
           requested benchmark according to the repository's metric priority hierarchy.
        """
        latest_complete_eval = (
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
            .join(EvaluationMetadata)
            .where(EvaluationModel.status == EvaluationStatus.COMPLETED)
            .subquery()
        )

        return (
            select(
                EvaluationModel.llm_id.label("model_id"),
                BenchmarkModel.name.label("benchmark_name"),
                MetricModel.name.label("metric_name"),
                MetricModel.value.label("value"),
                BenchmarkModel.effective_sample_count.label("effective_sample_count"),
                func.row_number()
                .over(
                    partition_by=(
                        EvaluationModel.llm_id,
                        BenchmarkModel.name,
                    ),
                    order_by=self.metric_priority,
                )
                .label("metric_rank"),
            )
            .join(
                latest_complete_eval,
                latest_complete_eval.c.evaluation_id == EvaluationModel.id,
            )
            .join(BenchmarkModel, BenchmarkModel.evaluation_id == EvaluationModel.id)
            .join(MetricModel, MetricModel.benchmark_id == BenchmarkModel.id)
            .where(
                latest_complete_eval.c.rank == 1,
                BenchmarkModel.name.in_(benchmark_names),
                MetricModel.value.is_not(None),
                MetricModel.name.in_(METRIC_PRIORITY),
            )
            .subquery()
        )

    def _group_scores_by_model(
        self, score_rows: list[tuple[uuid.UUID, str, str, float, int]]
    ) -> dict[uuid.UUID, dict[str, LeaderboardBenchmarkScore]]:
        scores_by_model: dict[uuid.UUID, dict[str, LeaderboardBenchmarkScore]] = {}

        for (
            model_id,
            benchmark_name,
            metric_name,
            value,
            effective_sample_count,
        ) in score_rows:
            model_scores = scores_by_model.setdefault(model_id, {})
            model_scores[benchmark_name] = LeaderboardBenchmarkScore(
                benchmark_name=benchmark_name,
                metric_name=metric_name,
                value=value,
                effective_sample_count=effective_sample_count,
            )

        return scores_by_model

    def _round_score(self, value: float | None) -> float | None:
        if value is None:
            return None

        return round(value, 5)
