from __future__ import annotations

import datetime as dt
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select
from passlib.hash import bcrypt

from backend.db import get_session
from backend.models import SessionToken, User


router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user(session=Depends(get_session), authorization: str = None) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token_val = authorization.split(" ", 1)[1]
    stmt = select(SessionToken).where(SessionToken.token == token_val, SessionToken.expires_at > dt.datetime.utcnow())
    st = session.exec(stmt).first()
    if not st:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = session.get(User, st.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


class LoginRequest(BaseModel):
    national_id: str
    pin: str


class LoginResponse(BaseModel):
    token: str
    expires_at: dt.datetime
    display_name: str


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, session=Depends(get_session)):
    stmt = select(User).where(User.national_id == payload.national_id)
    user = session.exec(stmt).first()
    if not user or not bcrypt.verify(payload.pin, user.hashed_pin):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = secrets.token_urlsafe(32)
    expires_at = dt.datetime.utcnow() + dt.timedelta(hours=24)
    st = SessionToken(token=token, user_id=user.id, expires_at=expires_at)
    session.add(st)
    session.commit()
    session.refresh(st)
    return LoginResponse(token=st.token, expires_at=st.expires_at, display_name=user.display_name)


@router.post("/logout")
def logout(session=Depends(get_session), authorization: str = None):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token_val = authorization.split(" ", 1)[1]
    stmt = select(SessionToken).where(SessionToken.token == token_val)
    st = session.exec(stmt).first()
    if st:
        session.delete(st)
        session.commit()
    return {"status": "logged out"}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "national_id": user.national_id,
        "display_name": user.display_name,
        "nationality": user.nationality,
    }

