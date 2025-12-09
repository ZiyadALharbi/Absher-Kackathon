from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from backend.api.auth import get_current_user
from backend.db import get_session
from backend.models import Violation
from backend.agents.tools.common import get_violation_by_number

router = APIRouter(prefix="/violations", tags=["violations"])


@router.get("/")
def list_violations_route(status: str | None = None, user=Depends(get_current_user), session=Depends(get_session)):
    stmt = select(Violation).where(Violation.user_id == user.id)
    if status:
        stmt = stmt.where(Violation.payment_status == status)
    viols = session.exec(stmt).all()
    return [
        {
            "id": v.id,
            "number": v.violation_number,
            "amount": v.amount,
            "status": v.payment_status,
            "city": v.city,
            "datetime": v.violation_datetime,
            "metadata": v.metadata,
        }
        for v in viols
    ]


@router.post("/extend")
def extend_violation(violation_number: str, user=Depends(get_current_user), session=Depends(get_session)):
    viol = get_violation_by_number(session, user.id, violation_number)
    if not viol:
        raise HTTPException(status_code=404, detail="المخالفة غير موجودة")
    if viol.payment_status != "unpaid":
        raise HTTPException(status_code=400, detail="التمديد متاح فقط للمخالفات غير المسددة")
    meta = viol.metadata or {}
    if meta.get("extension_requested"):
        raise HTTPException(status_code=400, detail="تم طلب التمديد مسبقاً")
    meta["extension_requested"] = True
    meta["extension_requested_at"] = None
    viol.metadata = meta
    session.add(viol)
    session.commit()
    return {"status": "success", "violation_number": violation_number}


@router.post("/objection")
def violation_objection(violation_number: str, reason: str | None = None, user=Depends(get_current_user), session=Depends(get_session)):
    viol = get_violation_by_number(session, user.id, violation_number)
    if not viol:
        raise HTTPException(status_code=404, detail="المخالفة غير موجودة")
    meta = viol.metadata or {}
    if meta.get("objection_submitted"):
        raise HTTPException(status_code=400, detail="تم تقديم اعتراض سابق")
    meta["objection_submitted"] = True
    meta["objection_reason"] = reason
    meta["objection_submitted_at"] = None
    viol.metadata = meta
    session.add(viol)
    session.commit()
    return {"status": "success", "violation_number": violation_number}

