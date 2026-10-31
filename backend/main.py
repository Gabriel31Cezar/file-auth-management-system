from fastapi import FastAPI

import models  # noqa: F401
from auth import router as auth_router
from database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="File & Auth Management System",
    description="API de autenticação JWT e organizador de arquivos por categoria e data.",
    version="0.2.0",
)

app.include_router(auth_router)


@app.get("/")
def raiz():
    return {"mensagem": "API no ar"}