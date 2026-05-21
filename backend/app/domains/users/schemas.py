from sqlmodel import SQLModel


class UserBase(SQLModel):
    name: str
    email: str


# What clients send when creating a user
class UserCreate(UserBase):
    pass


# What API returns when reading a user
class UserRead(UserBase):
    id: int
