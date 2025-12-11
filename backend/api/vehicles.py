from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import select

from backend.api.auth import get_current_user
from backend.db import get_session
from backend.models import Vehicle

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("/")
def list_vehicles_route(user=Depends(get_current_user), session=Depends(get_session)):
    stmt = select(Vehicle).where(Vehicle.user_id == user.id)
    vehicles = session.exec(stmt).all()
    return [
        {
            "id": v.id,
            "plate": v.plate,
            "status": v.status,
            "expiry_date": v.expiry_date,
            "insurance_expiry": v.insurance_expiry,
            "metadata": v.meta,
        }
        for v in vehicles
    ]


