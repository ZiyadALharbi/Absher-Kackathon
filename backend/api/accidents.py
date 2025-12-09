from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from backend.api.auth import get_current_user
from backend.db import get_session
from backend.models import TrafficAccident
from backend.agents.tools.common import get_accident_by_number

router = APIRouter(prefix="/accidents", tags=["accidents"])


@router.get("/")
def list_accidents(user=Depends(get_current_user), session=Depends(get_session)):
    stmt = select(TrafficAccident).where(TrafficAccident.user_id == user.id)
    accs = session.exec(stmt).all()
    return [
        {
            "id": a.id,
            "accident_number": a.accident_number,
            "accident_date": a.accident_date,
            "plate_number": a.plate_number,
            "metadata": a.metadata,
        }
        for a in accs
    ]


@router.post("/report")
def issue_report(accident_number: str, user=Depends(get_current_user), session=Depends(get_session)):
    acc = get_accident_by_number(session, user.id, accident_number)
    if not acc:
        raise HTTPException(status_code=404, detail="الحادث غير موجود")
    meta = acc.metadata or {}
    if meta.get("report_issued"):
        raise HTTPException(status_code=400, detail="تم إصدار التقرير مسبقاً")
    meta["report_issued"] = True
    meta["report_issued_at"] = None
    acc.metadata = meta
    session.add(acc)
    session.commit()
    return {"status": "success", "accident_number": accident_number}


@router.post("/objection")
def accident_objection(accident_number: str, objection_type: str = "objection", user=Depends(get_current_user), session=Depends(get_session)):
    acc = get_accident_by_number(session, user.id, accident_number)
    if not acc:
        raise HTTPException(status_code=404, detail="الحادث غير موجود")
    meta = acc.metadata or {}
    if meta.get("objection_or_waiver"):
        raise HTTPException(status_code=400, detail="تم الاعتراض/التنازل مسبقاً")
    meta["objection_or_waiver"] = objection_type
    meta["objection_or_waiver_at"] = None
    acc.metadata = meta
    session.add(acc)
    session.commit()
    return {"status": "success", "accident_number": accident_number}

