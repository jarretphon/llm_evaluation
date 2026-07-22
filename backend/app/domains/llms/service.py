import uuid

from app.domains.llms.errors import LLMNameAlreadyExistsError, LLMNotFoundError
from app.domains.llms.models import LLMModel
from app.domains.llms.repository import LLMRepository
from app.domains.llms.schemas import LLMCreate, LLMUpdate


class LLMService:
    def __init__(self, repository: LLMRepository) -> None:
        self.repository = repository

    def list_llms(self, offset: int = 0, limit: int = 10) -> list[LLMModel]:
        return self.repository.list_llms(offset=offset, limit=limit)

    def get_llm(self, llm_id: uuid.UUID) -> LLMModel:
        llm = self.repository.get_by_id(llm_id)

        if llm is None:
            raise LLMNotFoundError(llm_id)

        return llm

    def create_llm(self, llm_create: LLMCreate) -> LLMModel:
        existing_llm = self.repository.get_by_name(llm_create.name)
        if existing_llm is not None:
            raise LLMNameAlreadyExistsError(llm_create.name)

        return self.repository.create_llm(llm_create)

    def edit_llm(self, llm_id: uuid.UUID, llm_update: LLMUpdate) -> LLMModel:
        llm_entry = self.repository.get_by_id(llm_id)

        if llm_entry is None:
            raise LLMNotFoundError(llm_id)

        if llm_update.name is not None:
            existing_llm = self.repository.get_by_name(llm_update.name)
            if existing_llm is not None and existing_llm.id != llm_entry.id:
                raise LLMNameAlreadyExistsError(llm_update.name)

        return self.repository.edit_llm(llm_entry, llm_update)

    def delete_llm(self, llm_id: uuid.UUID) -> None:
        llm_entry = self.repository.get_by_id(llm_id)

        if llm_entry is None:
            raise LLMNotFoundError(llm_id)

        self.repository.delete_llm(llm_entry)
