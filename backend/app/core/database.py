from sqlmodel import SQLModel, create_engine
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)

def init_db():
    from app.models import Task, Plan, Session, User  # register models
    SQLModel.metadata.create_all(engine)