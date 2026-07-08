from celery import Celery
from celery.signals import worker_process_init

from .config import settings

app = Celery(
    "llm-evaluation", broker=settings.broker_url, backend=settings.result_backend_url
)

app.autodiscover_tasks(["app.domains.evaluations"])


@worker_process_init.connect
def init_worker(**kwargs):
    """
    Executes inside each parallel worker fork on birth.
    Ensures SQLModel reads all multi-domain file configurations
    so related tables link properly before taking tasks off RabbitMQ.
    """
    import app.db.base  # noqa: F401
