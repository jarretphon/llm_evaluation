from typing import Annotated

from app.db.session import SessionDep
from app.domains.comparisons.repository import ComparisonRepository
from app.domains.comparisons.service import ComparisonService
from fastapi import Depends


def get_comparison_service(session: SessionDep) -> ComparisonService:
    repository = ComparisonRepository(session)
    return ComparisonService(repository)


ComparisonServiceDep = Annotated[ComparisonService, Depends(get_comparison_service)]
