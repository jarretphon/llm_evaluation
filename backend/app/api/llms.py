import uuid

from fastapi import APIRouter, HTTPException, Query, status

from app.domains.llms.dependencies import LLMServiceDep
from app.domains.llms.errors import LLMNotFoundError
from app.domains.llms.schemas import LLMCreate, LLMRead, LLMUpdate

router = APIRouter()


@router.get("")
def get_all_llms(
    service: LLMServiceDep,
    offset: int = 0,
    limit: int = Query(default=10, ge=1, le=100),
) -> list[LLMRead]:
    return service.list_llms(offset=offset, limit=limit)


@router.get("/{llm_id}")
def read_llm(llm_id: uuid.UUID, service: LLMServiceDep) -> LLMRead:
    return service.get_llm(llm_id)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_llm(llm_create: LLMCreate, service: LLMServiceDep) -> LLMRead:
    return service.create_llm(llm_create)


@router.patch("/{llm_id}")
def edit_llm(
    llm_id: uuid.UUID,
    llm_update: LLMUpdate,
    service: LLMServiceDep,
) -> LLMRead:
    try:
        return service.edit_llm(llm_id, llm_update)
    except LLMNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{llm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_llm(llm_id: uuid.UUID, service: LLMServiceDep) -> None:
    try:
        service.delete_llm(llm_id)
    except LLMNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
