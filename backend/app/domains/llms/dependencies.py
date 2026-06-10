from typing import Annotated

from app.db.session import SessionDep
from app.domains.llms.repository import LLMRepository
from app.domains.llms.service import LLMService
from fastapi import Depends


def get_llm_service(session: SessionDep) -> LLMService:
    repository = LLMRepository(session)
    return LLMService(repository)


LLMServiceDep = Annotated[LLMService, Depends(get_llm_service)]
