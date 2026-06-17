from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.database.connection import create_db_and_tables
from app.routers import ai, health, movies


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix=settings.api_prefix)
    app.include_router(movies.router, prefix=settings.api_prefix)
    app.include_router(ai.router, prefix=settings.api_prefix)

    @app.on_event("startup")
    async def on_startup() -> None:
        await create_db_and_tables()

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={
                "error": "validation_error",
                "message": "Request validation failed.",
                "details": exc.errors(),
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_exception_handler(
        request: Request,
        exc: SQLAlchemyError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "error": "database_error",
                "message": "Database operation failed.",
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        if settings.debug:
            message = str(exc)
        else:
            message = "Internal server error."

        return JSONResponse(
            status_code=500,
            content={
                "error": "internal_server_error",
                "message": message,
            },
        )

    return app


app = create_app()
