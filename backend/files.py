import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import FileRecord, User
from organizer import organize_file
from schemas import FileOut

router = APIRouter(prefix="/files", tags=["Arquivos"])

STORAGE_DIR = Path(__file__).parent / "storage"
INBOX_DIR = STORAGE_DIR / "inbox"
ORGANIZED_DIR = STORAGE_DIR / "organized"
MAX_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload", response_model=FileOut, status_code=status.HTTP_201_CREATED)
def upload_file(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    nome = Path((arquivo.filename or "").replace("\\", "/")).name
    if nome in ("", ".", ".."):
        raise HTTPException(status_code=400, detail="Arquivo sem nome válido.")

    pasta_temp = INBOX_DIR / uuid.uuid4().hex
    pasta_temp.mkdir(parents=True)
    temporario = pasta_temp / nome
    tamanho = 0

    try:
        with temporario.open("wb") as saida:
            while bloco := arquivo.file.read(1024 * 1024):
                tamanho += len(bloco)
                if tamanho > MAX_SIZE:
                    raise HTTPException(
                        status_code=413, detail="Arquivo maior que 50 MB."
                    )
                saida.write(bloco)

        duplicado = (
            db.scalar(
                select(FileRecord.id).where(
                    FileRecord.owner_id == user.id,
                    FileRecord.original_name == nome,
                )
            )
            is not None
        )
        resultado = organize_file(temporario, ORGANIZED_DIR / user.username)
    finally:
        shutil.rmtree(pasta_temp, ignore_errors=True)

    registro = FileRecord(
        owner_id=user.id,
        original_name=nome,
        category=resultado["categoria"],
        stored_path=resultado["destino"],
        size=tamanho,
        status="Duplicado" if duplicado else "Organizado",
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return registro


@router.get("", response_model=list[FileOut])
def listar_historico(
    busca: str | None = None,
    categoria: str | None = None,
    limite: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    consulta = select(FileRecord).where(FileRecord.owner_id == user.id)
    if busca:
        consulta = consulta.where(FileRecord.original_name.ilike(f"%{busca}%"))
    if categoria:
        consulta = consulta.where(FileRecord.category == categoria)
    consulta = consulta.order_by(FileRecord.created_at.desc()).limit(limite)
    return list(db.scalars(consulta))