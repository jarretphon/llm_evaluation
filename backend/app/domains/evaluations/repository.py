import uuid

from app.domains.evaluations.models import EvaluationModel
from sqlmodel import Session, select


class EvaluationRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_evaluations(
        self, offset: int = 0, limit: int = 10
    ) -> list[EvaluationModel]:
        statement = select(EvaluationModel).offset(offset).limit(limit)
        return list(self.session.exec(statement).all())

    def get_by_id(self, id: uuid.UUID) -> EvaluationModel | None:
        statement = select(EvaluationModel).where(EvaluationModel.id == id)
        return self.session.exec(statement).first()

    def create_evaluation(self, evaluation: EvaluationModel) -> EvaluationModel:
        self.session.add(evaluation)
        self.session.commit()
        self.session.refresh(evaluation)

        return evaluation
