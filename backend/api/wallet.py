from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import select

from backend.api.auth import get_current_user
from backend.db import get_session
from backend.models import Wallet, WalletTransaction
from backend.agents.tools.common import get_or_create_wallet

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("/")
def wallet_balance(user=Depends(get_current_user), session=Depends(get_session)):
    wallet = get_or_create_wallet(session, user.id)
    return {"balance": wallet.balance, "currency": wallet.currency}


@router.get("/transactions")
def wallet_transactions(user=Depends(get_current_user), session=Depends(get_session)):
    wallet = get_or_create_wallet(session, user.id)
    stmt = select(WalletTransaction).where(WalletTransaction.wallet_id == wallet.id).order_by(WalletTransaction.created_at.desc())
    txs = session.exec(stmt).all()
    return [
        {
            "amount": tx.amount,
            "type": tx.type,
            "reference": tx.reference,
            "status": tx.status,
            "created_at": tx.created_at,
        }
        for tx in txs
    ]

