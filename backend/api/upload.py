from __future__ import annotations

import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from backend.api.auth import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)


@router.post("/")
async def upload_file(user=Depends(get_current_user), file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="لا يوجد اسم ملف")
    ext = Path(file.filename).suffix
    fname = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / fname
    content = await file.read()
    dest.write_bytes(content)
    return {"file_id": fname, "original_name": file.filename}

