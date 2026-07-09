from app.db.session import engine
from app.domains.evaluations.dependencies import get_evaluation_service
from celery import shared_task
from sqlmodel import Session


@shared_task(ignore_result=True)
def run_evaluation_task(evaluation_id: str):
    with Session(engine) as session:
        evaluation_service = get_evaluation_service(session)
        evaluation_service.run_registered_evaluation(evaluation_id)
