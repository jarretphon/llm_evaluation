import json

import pika
from app.core.config import settings
from app.domains.evaluations.models import EvaluationModel
from app.domains.evaluations.schemas import EvaluationRead

EVALUATION_UPDATES_EXCHANGE = "evaluation_updates"
EVALUATION_UPDATES_ROUTING_KEY = "evaluation.*"


def get_evaluation_routing_key(evaluation_id: str) -> str:
    return f"evaluation.{evaluation_id}"


def build_evaluation_update_payload(evaluation: EvaluationModel) -> str:
    evaluation_read = EvaluationRead.model_validate(evaluation, from_attributes=True)
    return json.dumps(evaluation_read.model_dump(mode="json"))


def publish_evaluation_update(evaluation: EvaluationModel) -> None:
    params = pika.URLParameters(settings.broker_url)
    connection = pika.BlockingConnection(params)

    try:
        channel = connection.channel()
        channel.exchange_declare(
            exchange=EVALUATION_UPDATES_EXCHANGE,
            exchange_type="topic",
        )
        channel.basic_publish(
            exchange=EVALUATION_UPDATES_EXCHANGE,
            routing_key=get_evaluation_routing_key(str(evaluation.id)),
            body=build_evaluation_update_payload(evaluation),
            properties=pika.BasicProperties(content_type="application/json"),
        )
    finally:
        connection.close()
