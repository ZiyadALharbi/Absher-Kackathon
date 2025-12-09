from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from backend.api.auth import get_current_user
from backend.models import User

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/profile")
def profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "national_id": user.national_id,
        "display_name": user.display_name,
        "nationality": user.nationality,
        "birth_date": user.birth_date,
    }

