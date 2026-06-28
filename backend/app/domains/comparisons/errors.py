import uuid


class ComparisonModelNotFoundError(Exception):
    def __init__(self, model_id: uuid.UUID) -> None:
        self.model_id = model_id
        super().__init__(f"Model with id={model_id} was not found")
