from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

import models  # noqa: F401
from auth import router as auth_router
from database import Base, engine
from files import router as files_router

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="File & Auth Management System",
    description="API de autenticação JWT e organizador de arquivos por categoria e data.",
    version="0.4.0",
)

app.include_router(auth_router)
app.include_router(files_router)


@app.get("/saude", tags=["Sistema"])
def saude():
    return {"mensagem": "API no ar"}


@app.get("/", include_in_schema=False)
def raiz():
    return RedirectResponse(url="/app/")


app.mount("/app", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")