from fastapi import FastAPI

import models  # noqa: F401
from auth import router as auth_router
from database import Base, engine
from files import router as files_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="File & Auth Management System",
    description="API de autenticação JWT e organizador de arquivos por categoria e data.",
    version="0.3.0",
)

app.include_router(auth_router)
app.include_router(files_router)


@app.get("/")
def raiz():
    return {"mensagem": "API no ar"}