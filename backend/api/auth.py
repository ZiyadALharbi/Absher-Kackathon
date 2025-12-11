from __future__ import annotations

import datetime as dt
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlmodel import Session, select
from passlib.hash import pbkdf2_sha256

from backend.db import get_session
from backend.models import SessionToken, User


router = APIRouter(prefix="/auth", tags=["auth"])
auth_scheme = HTTPBearer(auto_error=False)


def _utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def _prune_expired_tokens(session: Session) -> None:
    """Delete expired session tokens to limit table growth."""
    now = _utcnow()
    expired_stmt = select(SessionToken).where(SessionToken.expires_at <= now)
    expired = session.exec(expired_stmt).all()
    if expired:
        for token in expired:
            session.delete(token)
        session.commit()


def _find_valid_token(session: Session, raw_token: str) -> Optional[SessionToken]:
    """Return the matching non-expired session token by verifying the token hash."""
    now = _utcnow()
    stmt = select(SessionToken).where(SessionToken.expires_at > now)
    for st in session.exec(stmt).all():
        if pbkdf2_sha256.verify(raw_token, st.token):
            return st
    return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme),
    session: Session = Depends(get_session),
) -> User:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")

    _prune_expired_tokens(session)
    st = _find_valid_token(session, credentials.credentials)
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
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    _prune_expired_tokens(session)

    stmt = select(User).where(User.national_id == payload.national_id)
    user = session.exec(stmt).first()
    if not user or not pbkdf2_sha256.verify(payload.pin, user.hashed_pin):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    raw_token = secrets.token_urlsafe(32)
    expires_at = _utcnow() + dt.timedelta(hours=24)
    st = SessionToken(token=pbkdf2_sha256.hash(raw_token), user_id=user.id, expires_at=expires_at)
    session.add(st)
    session.commit()
    session.refresh(st)
    return LoginResponse(token=raw_token, expires_at=st.expires_at, display_name=user.display_name)


@router.post("/logout")
def logout(
    session: Session = Depends(get_session),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme),
):
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")

    _prune_expired_tokens(session)
    st = _find_valid_token(session, credentials.credentials)
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

