from app.domains.users.models import User
from app.domains.users.schemas import UserCreate
from sqlmodel import Session, select


class UserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_users(self, offset: int = 0, limit: int = 10) -> list[User]:
        statement = select(User).offset(offset).limit(limit)
        return list(self.session.exec(statement).all())

    def get_by_id(self, id: int) -> User | None:
        statement = select(User).where(User.id == id)
        return self.session.exec(statement).first()

    def create_user(self, user_create: UserCreate) -> User:
        user = User.model_validate(user_create)

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        return user
