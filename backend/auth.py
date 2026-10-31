from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import User
from schemas import Token, UserCreate, UserOut
from security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(dados: UserCreate, db: Session = Depends(get_db)):
    existente = db.scalar(
        select(User).where(
            or_(User.email == dados.email, User.username == dados.username)
        )
    )
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail ou usuário já cadastrado.",
        )
    user = User(
        email=dados.email,
        username=dados.username,
        hashed_password=hash_password(dados.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Usuário ou senha incorretos.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user = db.execute(
        select(User).where(
            or_(User.username == form.username, User.email == form.username)
        )
    ).scalar_one_or_none()

    if user is None:
        raise credenciais_invalidas
    if not verify_password(form.password, user.hashed_password):
        raise credenciais_invalidas

    return Token(access_token=create_access_token(user.username))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user