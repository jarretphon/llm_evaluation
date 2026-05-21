from app.domains.users.errors import UserNotFoundError
from app.domains.users.models import User
from app.domains.users.repository import UserRepository
from app.domains.users.schemas import UserCreate


class UserService:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def list_users(self, offset: int = 0, limit: int = 10) -> list[User]:
        return self.repository.list_users(offset=offset, limit=limit)

    def get_user(self, user_id: int) -> User:
        user = self.repository.get_by_id(user_id)

        if user is None:
            raise UserNotFoundError(user_id)

        return user

    def create_user(self, user_create: UserCreate) -> User:
        return self.repository.create_user(user_create)
