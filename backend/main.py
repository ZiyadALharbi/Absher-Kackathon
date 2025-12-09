from __future__ import annotations


import secrets
import datetime as dt
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Header, CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlmodel import select
from passlib.hash import bcrypt

from .db import init_db, get_session
from .models import User, SessionToken
from .api import auth as auth_api
from .api import agent as agent_api
from .api import user as user_api
from .api import wallet as wallet_api
from .api import violations as violations_api
from .api import accidents as accidents_api
from .api import vehicles as vehicles_api
from .api import identity as identity_api
from .api import auth as auth_api
auth_scheme = HTTPBearer(auto_error=False) # why auto_error is False? answer: to allow the user to login without a token. so that the user can login with the national_id and pin.


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables once on startup
    init_db()
    # seed demo user if not exist
    with next(get_session()) as session:
        stmt = select(User).where(User.national_id == "1111")
        user = session.exec(stmt).first()
        if not user:
            demo = User(
                national_id = "1111",
                display_name = "Demo User",
                hashed_pin= bcrypt.hash("123456"),
                nationality = "Saudi",
            )
            session.add(demo)
            session.commit()
    yield # why? why not return the session? because the session is already yielded in the get_session function. so what yeild to here? answer: to yield the session to the lifespan function. so that the lifespan function can use the session to commit the changes to the database.


app = FastAPI(title="Absher Agent Backend", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    national_id: str
    pin: str


class LoginResponse(BaseModel):
    token: str
    expires_at: dt.datetime
    display_name: str


def create_session_token(user_id: int, session):
    token = secrets.token_urlsafe(32)
    expires_at = dt.datetime.timezone.utc() + dt.datetime.timedelta(days=6) # check later
    st = SessionToken(token=token, user_id=user_id, expires_at=expires_at)
    session.add(st) # what it do? answer: add the session token to the database.
    session.commit() # what it do? answer: commit the changes to the database.
    session.refresh(st) # what it do? answer: refresh the session token to get the id. so that we can return the session token to the user.
    return st


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme), # what Depends do? answer: it is a dependency injection. it is used to get the credentials from the user.
    session=Depends(get_session), # what Depends do? answer: it is a dependency injection. it is used to get the session from the database.
):
    if not credentials or credentials.scheme.lower() != "bearer": # what is credentials.scheme.lower() != "bearer"? answer: it is used to check if the credentials are valid.
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials # what is credentials.credentials? answer: it is the token from the user.
    stmt = select(SessionToken).where(
        SessionToken.token == token, SessionToken.expires_at > dt.datetime.utcnow()
    )
    st = session.exec(stmt).first()
    if not st:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = session.get(User, st.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@app.post("auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, session=Depends(get_session)):
    stmt = select(User).where(User.national_id == payload.national_id)
    user = session.exec(stmt).first()
    if not user or not bcrypt.verify(payload.pin, user.hashed_pin):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    st = create_session_token(user.id, session)
    return LoginResponse(token=st.token, expires_at=st.expires_at, display_name=user.display_name)

@app.post("/auth/logout")
def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme),
    session=Depends(get_session),
):
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    stmt = select(SessionToken).where(SessionToken.token == token)
    st = session.exec(stmt).first()
    if st:
        session.delete(st)
        session.commit()
    return {"status": "logged out"}


@app.get("/auth/me")
def me(user=Depends(get_current_user)):
    return {
        "national_id": user.national_id,
        "display_name": user.display_name,
        "nationality": user.nationality,
    }



@app.get("/health")
async def healthcheck():
    return {"status": "ok"}

# mount routers
app.include_router(auth_api.router)
app.include_router(agent_api.router)
app.include_router(user_api.router)
app.include_router(wallet_api.router)
app.include_router(violations_api.router)
app.include_router(accidents_api.router)
app.include_router(vehicles_api.router)
app.include_router(identity_api.router)
