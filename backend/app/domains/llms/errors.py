import uuid


class LLMNotFoundError(Exception):
    def __init__(self, llm_id: uuid.UUID) -> None:
        self.llm_id = llm_id
        super().__init__(f"LLM with id={llm_id} was not found")


class LLMNameAlreadyExistsError(Exception):
    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__(f"LLM with name={name!r} already exists")
