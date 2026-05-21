from fastapi import APIRouter, Query, status

from app.domains.users.dependencies import UserServiceDep
from app.domains.users.schemas import UserCreate, UserRead

router = APIRouter()


@router.get("")
def get_all_users(
    service: UserServiceDep,
    offset: int = 0,
    limit: int = Query(default=10, ge=1, le=100),
) -> list[UserRead]:
    return service.list_users(offset=offset, limit=limit)


@router.get("/{user_id}")
def read_user(user_id: int, service: UserServiceDep) -> UserRead:
    return service.get_user(user_id)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(user_create: UserCreate, service: UserServiceDep) -> UserRead:
    return service.create_user(user_create)


# @router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_user(user_id: int, service: UserServiceDep) -> None:
#     service.delete_user(user_id)
