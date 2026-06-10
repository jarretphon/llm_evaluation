import uuid

from app.domains.llms.models import LLMModel
from app.domains.llms.schemas import LLMCreate, LLMUpdate
from sqlmodel import Session, select


class LLMRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_llms(self, offset: int = 0, limit: int = 10) -> list[LLMModel]:
        statement = select(LLMModel).offset(offset).limit(limit)
        return list(self.session.exec(statement).all())

    def get_by_id(self, id: uuid.UUID) -> LLMModel | None:
        statement = select(LLMModel).where(LLMModel.id == id)
        return self.session.exec(statement).first()

    def create_llm(self, llm_create: LLMCreate) -> LLMModel:
        llm = LLMModel.model_validate(llm_create)

        self.session.add(llm)
        self.session.commit()
        self.session.refresh(llm)

        return llm

    def delete_llm(self, llm_db_entry: LLMModel) -> None:
        self.session.delete(llm_db_entry)
        self.session.commit()

    def edit_llm(self, llm_db_entry: LLMModel, llm_update: LLMUpdate) -> LLMModel:

        changes = llm_update.model_dump(exclude_unset=True)
        print(changes)
        for key, value in changes.items():
            setattr(llm_db_entry, key, value)

        self.session.add(llm_db_entry)
        self.session.commit()
        self.session.refresh(llm_db_entry)

        return llm_db_entry
