from app.domains.evaluations.models import (
    BenchmarkModel,
    EvaluationMetadata,
    EvaluationModel,
    EvaluationStatus,
    MetricModel,
)
from app.domains.llms.models import LLMModel
from sqlalchemy import and_, case, cast, func, literal
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Session, select

METRIC_PRIORITY = ("acc", "acc_norm", "exact_match")


class LeaderboardRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_leaderboard_rows(self, benchmark_names: list[str]):
        if not benchmark_names:
            return []

        # Filtered rows consisting of latest complete evaluations for each model,
        # with their highest priority metric for each selected benchmark.
        selected_scores = self._get_selected_scores_subquery(benchmark_names)

        # Get aggregate scores for each model across all selected benchmarks
        model_aggregate_scores = self._get_model_aggregate_score_subquery(
            selected_scores
        )

        # Get benchmark scores for each model across all selected benchmarks
        model_benchmark_groups = self._get_model_benchmark_group_subquery(
            selected_scores
        )

        # Order and rank models based on their aggregate scores and completion of selected benchmarks
        completed_benchmark_count = func.coalesce(
            model_aggregate_scores.c.completed_benchmark_count, 0
        )
        has_all_selected_benchmarks = and_(
            completed_benchmark_count == len(benchmark_names),
            model_aggregate_scores.c.weighted_average.is_not(None),
        )
        complete_models_first = case(
            (has_all_selected_benchmarks, 0),
            else_=1,
        )
        complete_model_score = case(
            (has_all_selected_benchmarks, model_aggregate_scores.c.weighted_average),
            else_=None,
        )
        internal_rank = func.row_number().over(
            order_by=(
                complete_models_first,
                complete_model_score.desc().nullslast(),
                completed_benchmark_count.desc(),
                model_aggregate_scores.c.weighted_average.desc().nullslast(),
                LLMModel.name,
            )
        )
        leaderboard_rank = case(
            (has_all_selected_benchmarks, internal_rank),
            else_=None,
        )

        statement = (
            select(
                LLMModel.id,
                LLMModel.name,
                LLMModel.provider,
                model_aggregate_scores.c.weighted_average,
                completed_benchmark_count,
                leaderboard_rank.label("rank"),
                func.coalesce(
                    model_benchmark_groups.c.scores, self._empty_scores_value()
                ).label("scores"),
            )
            .outerjoin(
                model_aggregate_scores, model_aggregate_scores.c.model_id == LLMModel.id
            )
            .outerjoin(
                model_benchmark_groups, model_benchmark_groups.c.model_id == LLMModel.id
            )
            .order_by(
                complete_models_first,
                complete_model_score.desc().nullslast(),
                completed_benchmark_count.desc(),
                model_aggregate_scores.c.weighted_average.desc().nullslast(),
                LLMModel.name,
            )
        )

        return list(self.session.exec(statement).all())

    def _get_selected_scores_subquery(self, benchmark_names: list[str]):
        latest_complete_evaluations = self._get_last_complete_evaluation_subquery()
        ranked_metrics = self._get_metric_priority_subquery(
            benchmark_names, latest_complete_evaluations
        )

        return (
            select(
                ranked_metrics.c.model_id,
                ranked_metrics.c.benchmark_name,
                ranked_metrics.c.metric_name,
                ranked_metrics.c.value,
                ranked_metrics.c.n_samples,
            )
            .where(ranked_metrics.c.metric_rank == 1)
            .subquery()
        )

    def _get_model_aggregate_score_subquery(self, selected_scores):
        completed_benchmark_count = func.count(selected_scores.c.benchmark_name)
        weighted_average = func.sum(
            selected_scores.c.value * selected_scores.c.n_samples
        ) / func.nullif(func.sum(selected_scores.c.n_samples), 0)

        return (
            select(
                selected_scores.c.model_id,
                weighted_average.label("weighted_average"),
                completed_benchmark_count.label("completed_benchmark_count"),
            )
            .group_by(selected_scores.c.model_id)
            .subquery()
        )

    def _get_model_benchmark_group_subquery(self, selected_scores):
        return (
            select(
                selected_scores.c.model_id,
                func.jsonb_object_agg(
                    selected_scores.c.benchmark_name,
                    func.jsonb_build_object(
                        "metric",
                        selected_scores.c.metric_name,
                        "value",
                        selected_scores.c.value,
                        "effective_sample_count",
                        selected_scores.c.n_samples,
                    ),
                ).label("scores"),
            )
            .group_by(selected_scores.c.model_id)
            .subquery()
        )

    def _get_last_complete_evaluation_subquery(self):
        """Rank each model's completed evaluations from newest to oldest."""
        return (
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
            .join(
                EvaluationMetadata,
                EvaluationMetadata.evaluation_id == EvaluationModel.id,
            )
            .where(EvaluationModel.status == EvaluationStatus.COMPLETED)
            .subquery()
        )

    def _get_metric_priority_subquery(
        self, benchmark_names: list[str], latest_complete_evaluations
    ):
        """Rank available metrics for each selected benchmark by priority."""
        metric_priority = case(
            *(
                (MetricModel.name == metric_name, priority)
                for priority, metric_name in enumerate(METRIC_PRIORITY, start=1)
            ),
            else_=len(METRIC_PRIORITY) + 1,
        )

        return (
            select(
                EvaluationModel.llm_id.label("model_id"),
                BenchmarkModel.name.label("benchmark_name"),
                MetricModel.name.label("metric_name"),
                MetricModel.value.label("value"),
                BenchmarkModel.n_samples.label("n_samples"),
                func.row_number()
                .over(
                    partition_by=(
                        EvaluationModel.llm_id,
                        BenchmarkModel.name,
                    ),
                    order_by=(metric_priority, MetricModel.name),
                )
                .label("metric_rank"),
            )
            .join(
                latest_complete_evaluations,
                latest_complete_evaluations.c.evaluation_id == EvaluationModel.id,
            )
            .join(BenchmarkModel, BenchmarkModel.evaluation_id == EvaluationModel.id)
            .join(MetricModel, MetricModel.benchmark_id == BenchmarkModel.id)
            .where(
                latest_complete_evaluations.c.rank == 1,
                BenchmarkModel.status == EvaluationStatus.COMPLETED,
                BenchmarkModel.name.in_(benchmark_names),
                MetricModel.value.is_not(None),
                MetricModel.name.in_(METRIC_PRIORITY),
            )
            .subquery()
        )

    def _empty_scores_value(self):
        return cast(literal("{}"), JSONB)
