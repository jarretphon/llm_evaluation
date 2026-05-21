from typing import Annotated

from app.db.session import SessionDep
from app.domains.users.repository import UserRepository
from app.domains.users.service import UserService
from fastapi import Depends


def get_user_service(session: SessionDep) -> UserService:
    repository = UserRepository(session)
    return UserService(repository)


UserServiceDep = Annotated[UserService, Depends(get_user_service)]
