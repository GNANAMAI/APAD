"""SQLAlchemy engine and session — SQLite (local) or PostgreSQL (Neon/production)."""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings


def _normalize_database_url(url: str) -> str:
    """SQLAlchemy 2 expects postgresql:// (not legacy postgres://)."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def _build_engine():
    settings = get_settings()
    url = _normalize_database_url(settings.database_url)

    connect_args: dict = {}
    engine_kwargs: dict = {}

    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    else:
        # Neon / Postgres: avoid stale connections on serverless poolers
        engine_kwargs["pool_pre_ping"] = True
        engine_kwargs["pool_recycle"] = 300
        engine_kwargs["pool_size"] = settings.db_pool_size
        engine_kwargs["max_overflow"] = settings.db_max_overflow

    return create_engine(url, connect_args=connect_args, **engine_kwargs)


settings = get_settings()
engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_ad_completion_gate_column() -> None:
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "ad_completions" not in insp.get_table_names():
        return
    columns = {col["name"] for col in insp.get_columns("ad_completions")}
    if "gate" in columns:
        return
    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE ad_completions ADD COLUMN gate VARCHAR(32) DEFAULT 'login'"
            )
        )


def _ensure_campaign_priority_column() -> None:
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "campaigns" not in insp.get_table_names():
        return
    columns = {col["name"] for col in insp.get_columns("campaigns")}
    if "priority" in columns:
        return
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE campaigns ADD COLUMN priority INTEGER DEFAULT 0"))


def _ensure_user_email_column() -> None:
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return
    columns = {col["name"] for col in insp.get_columns("users")}
    if "email" in columns:
        return
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255)"))
        conn.execute(
            text(
                "UPDATE users SET email = LOWER(mobile) || '@legacy.apad.app' "
                "WHERE email IS NULL OR email = ''"
            )
        )


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_campaign_priority_column()
    _ensure_ad_completion_gate_column()
    _ensure_user_email_column()


def check_db_connection() -> bool:
    """Return True if the database accepts a connection."""
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return True
