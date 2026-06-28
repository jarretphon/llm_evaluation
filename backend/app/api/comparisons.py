from fastapi import APIRouter, HTTPException, status

from app.domains.comparisons.dependency import ComparisonServiceDep
from app.domains.comparisons.errors import ComparisonModelNotFoundError
from app.domains.comparisons.schemas import ComparisonRead, ComparisonRequest

router = APIRouter()


@router.post("")
def compare_models(
    comparison_request: ComparisonRequest,
    service: ComparisonServiceDep,
) -> ComparisonRead:
    try:
        return service.compare_models(comparison_request)
    except ComparisonModelNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
