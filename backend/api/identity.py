from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from backend.api.auth import get_current_user
from backend.db import get_session
from backend.models import Action

router = APIRouter(prefix="/id", tags=["identity"])


@router.post("/family-issue")
def family_issue(user=Depends(get_current_user), session=Depends(get_session)):
    action = Action(
        action_type="national_id_issue_family_member",
        status="pending",
        cost=None,
        payload={},
        result={},
    )
    session.add(action)
    session.commit()
    session.refresh(action)
    return {"status": "submitted", "action_id": action.id, "service_code": "national_id_issue_family_member"}


@router.post("/renew")
def renew(user=Depends(get_current_user), session=Depends(get_session)):
    action = Action(
        action_type="national_id_renewal",
        status="pending",
        cost=None,
        payload={},
        result={},
    )
    session.add(action)
    session.commit()
    session.refresh(action)
    return {"status": "submitted", "action_id": action.id, "service_code": "national_id_renewal"}


@router.post("/replace-lost")
def replace_lost(user=Depends(get_current_user), session=Depends(get_session)):
    action = Action(
        action_type="national_id_replacement_lost",
        status="pending",
        cost=None,
        payload={},
        result={},
    )
    session.add(action)
    session.commit()
    session.refresh(action)
    return {"status": "submitted", "action_id": action.id, "service_code": "national_id_replacement_lost"}


@router.post("/replace-damaged")
def replace_damaged(user=Depends(get_current_user), session=Depends(get_session)):
    action = Action(
        action_type="national_id_replacement_damaged",
        status="pending",
        cost=None,
        payload={},
        result={},
    )
    session.add(action)
    session.commit()
    session.refresh(action)
    return {"status": "submitted", "action_id": action.id, "service_code": "national_id_replacement_damaged"}


@router.get("/requests")
def list_requests(user=Depends(get_current_user), session=Depends(get_session)):
    stmt = select(Action).where(Action.action_type.like("national_id_%"))
    actions = session.exec(stmt).all()
    return [
        {
            "id": a.id,
            "action_type": a.action_type,
            "status": a.status,
            "payload": a.payload,
            "result": a.result,
            "created_at": a.created_at,
        }
        for a in actions
    ]

