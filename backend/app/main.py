from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import check_db_connection, init_db, SessionLocal
from app.routers import ads, analytics, auth, campaigns, otp, preview, tokens, users
from app.seed import seed_demo_data

import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    try:
        check_db_connection()
        logger.info(
            "Database connected (%s)",
            "PostgreSQL" if settings.is_postgres else "SQLite",
        )
    except Exception as exc:
        logger.error("Database connection failed: %s", exc)
        raise

    init_db()
    if settings.seed_demo_data:
        db = SessionLocal()
        try:
            seed_demo_data(db)
        finally:
            db.close()
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = settings.api_prefix
app.include_router(auth.router, prefix=api)
app.include_router(users.router, prefix=api)
app.include_router(campaigns.router, prefix=api)
app.include_router(tokens.router, prefix=api)
app.include_router(ads.router, prefix=api)
app.include_router(otp.router, prefix=api)
app.include_router(analytics.router, prefix=api)
app.include_router(preview.router)


@app.get("/health")
def health():
    db_ok = False
    try:
        db_ok = check_db_connection()
    except Exception:
        pass
    return {
        "status": "ok" if db_ok else "degraded",
        "app": settings.app_name,
        "database": "connected" if db_ok else "unavailable",
        "db_driver": "postgresql" if settings.is_postgres else "sqlite",
    }
