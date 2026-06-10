import uuid


class EvaluationNotFoundError(Exception):
    def __init__(self, evaluation_id: uuid.UUID) -> None:
        self.evaluation_id = evaluation_id
        super().__init__(f"Evaluation with ID {evaluation_id} not found.")
