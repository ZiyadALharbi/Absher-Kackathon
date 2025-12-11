from __future__ import annotations

from sqlmodel import SQLModel, Session, create_engine

# SQLite for hackathon demo; use tmp path to avoid repo permission issues
DATABASE_URL = "sqlite:////tmp/absher.db"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def get_session() -> Session:
    """FastAPI dependency for DB session."""
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """Create tables on startup."""
    SQLModel.metadata.create_all(engine)

