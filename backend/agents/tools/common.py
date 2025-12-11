from __future__ import annotations

import json
import datetime as dt
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from sqlmodel import Session, select

from backend.db import engine
from backend.models import (
    User,
    Wallet,
    WalletTransaction,
    Payment,
    Violation,
    TrafficAccident,
    Vehicle,
)

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
REQ_PATH = BASE_DIR / "data" / "service_requirements.json"


# ---------- Requirements / FAQ ----------
def load_service_requirements_from_store(service_code: str) -> Dict[str, Any]:
    if not REQ_PATH.exists():
        return {}
    data = json.loads(REQ_PATH.read_text(encoding="utf-8"))
    for svc in data.get("services", []):
        if svc.get("code") == service_code or svc.get("name") == service_code:
            return svc
    return {}


def fetch_faq_for_service(service_code: Optional[str]) -> str:
    if not service_code:
        return "استفسار عام عن الخدمات."
    req = load_service_requirements_from_store(service_code)
    notes = req.get("notes") or []
    steps = req.get("steps") or []
    return "؛ ".join(notes + steps) or "استفسار عام عن الخدمات."


# ---------- Wallet helpers ----------
def get_or_create_wallet(session: Session, user_id: int) -> Wallet:
    stmt = select(Wallet).where(Wallet.user_id == user_id)
    wallet = session.exec(stmt).first()
    if wallet:
        return wallet
    wallet = Wallet(user_id=user_id, balance=0)
    session.add(wallet)
    session.commit()
    session.refresh(wallet)
    return wallet


def ensure_wallet_balance(session: Session, user_id: int, amount: int) -> Tuple[bool, int]:
    wallet = get_or_create_wallet(session, user_id)
    return wallet.balance >= amount, wallet.balance


def debit_wallet(session: Session, user_id: int, amount: int, reference: Optional[str] = None) -> None:
    wallet = get_or_create_wallet(session, user_id)
    if wallet.balance < amount:
        raise ValueError("رصيد المحفظة غير كافٍ")
    wallet.balance -= amount
    wallet.updated_at = dt.datetime.utcnow()
    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=-amount,
        type="debit",
        reference=reference,
        status="completed",
    )
    session.add(tx)
    session.commit()


def record_payment(session: Session, user_id: int, amount: int, reference: Optional[str] = None) -> Payment:
    payment = Payment(
        user_id=user_id,
        amount=amount,
        status="success",
        reference=reference,
        metadata={},
    )
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment


# ---------- Domain helpers ----------
def get_user(session: Session, user_id: int) -> Optional[User]:
    return session.get(User, user_id)


def get_violation_by_number(session: Session, user_id: int, violation_number: str) -> Optional[Violation]:
    stmt = select(Violation).where(
        Violation.user_id == user_id,
        Violation.violation_number == violation_number,
    )
    return session.exec(stmt).first()


def list_violations(session: Session, user_id: int, status: Optional[str] = None):
    stmt = select(Violation).where(Violation.user_id == user_id)
    if status:
        stmt = stmt.where(Violation.payment_status == status)
    return session.exec(stmt).all()


def get_accident_by_number(session: Session, user_id: int, accident_number: str) -> Optional[TrafficAccident]:
    stmt = select(TrafficAccident).where(
        TrafficAccident.user_id == user_id,
        TrafficAccident.accident_number == accident_number,
    )
    return session.exec(stmt).first()


def list_vehicles(session: Session, user_id: int):
    stmt = select(Vehicle).where(Vehicle.user_id == user_id)
    return session.exec(stmt).all()


# ---------- Auto-fill ----------
def auto_fill_system_fields(collected: Dict[str, Any], req: Dict[str, Any], user_id: Optional[int]) -> Dict[str, Any]:
    """
    Try to satisfy system-sourced fields from existing data (profile, wallet, violations, vehicles).
    This is a conservative auto-fill to reduce user prompts.
    """
    if user_id is None:
        return collected

    with Session(engine) as session:
        profile = get_user(session, user_id)
        wallet = get_or_create_wallet(session, user_id)
        unpaid_viols = list_violations(session, user_id, status="unpaid")
        vehicles = list_vehicles(session, user_id)
        accidents = session.exec(
            select(TrafficAccident).where(TrafficAccident.user_id == user_id)
        ).all()

        system_values = {
            "national_id": profile.national_id if profile else None,
            "display_name": profile.display_name if profile else None,
            "birth_date": profile.birth_date.isoformat() if profile and profile.birth_date else None,
            "nationality": profile.nationality if profile else None,
            "wallet_balance": wallet.balance,
            # Do NOT auto-fill violation_number/violation_id; let the user choose.
            "vehicle_plate": vehicles[0].plate if vehicles else None,
            "accident_number": accidents[0].accident_number if accidents else None,
        }

        for r in req.get("requirements", []):
            if r.get("source") == "system":
                field = r.get("key") or r.get("field")
                if field and field not in collected:
                    val = system_values.get(field)
                    if val is not None:
                        collected[field] = val

    return collected


# ---------- Validation ----------
def validate_with_tools(user_id: Optional[int], req: Dict[str, Any], collected: Dict[str, Any]) -> Tuple[list, bool, Optional[str]]:
    results = []
    human_required = False
    pause_reason = None

    payment_info = req.get("payment") or {}
    requires_payment = req.get("requires_payment", False) or bool(payment_info)

    fee = 0
    service_code = req.get("code") or req.get("name")
    if payment_info:
        if "fee" in payment_info:
            fee = int(payment_info["fee"])
        elif "fee_by_duration" in payment_info and "renewal_duration" in collected:
            fee = int(payment_info["fee_by_duration"].get(str(collected["renewal_duration"]), 0))
    # Special-case: violation payment uses the violation amount
    if service_code == "traffic_violation_payment":
        vnum = collected.get("violation_number")
        if vnum:
            with Session(engine) as session:
                viol = get_violation_by_number(session, user_id, vnum)
                if viol:
                    fee = int(viol.amount or 0)

    # Wallet check
    if requires_payment and fee > 0:
        if user_id is None:
            results.append({"check": "wallet_balance", "passed": False, "message": "المستخدم غير معروف"})
            return results, False, "المستخدم غير معروف"
        with Session(engine) as session:
            ok, bal = ensure_wallet_balance(session, user_id, fee)
            if not ok:
                results.append({"check": "wallet_balance", "passed": False, "message": f"الرصيد غير كافٍ. الرصيد الحالي: {bal}, المطلوب: {fee}"})
                return results, False, "رصيد غير كافٍ"
            else:
                results.append({"check": "wallet_balance", "passed": True, "message": "الرصيد كافٍ"})

    service_code = req.get("code") or req.get("name")

    def days_since(dtval: Optional[dt.datetime | dt.date]) -> Optional[int]:
        if not dtval:
            return None
        today = dt.date.today()
        if isinstance(dtval, dt.datetime):
            dtval = dtval.date()
        return (today - dtval).days

    # Domain-specific light checks
    if service_code in ("traffic_violation_payment_extension", "traffic_violation_objection"):
        violation_number = collected.get("violation_number")
        if violation_number:
            with Session(engine) as session:
                viol = get_violation_by_number(session, user_id, violation_number)
                if not viol:
                    results.append({"check": "violation_exists", "passed": False, "message": "المخالفة غير موجودة"})
                    return results, False, "المخالفة غير موجودة"
                if service_code == "traffic_violation_payment_extension":
                    if viol.payment_status != "unpaid":
                        results.append({"check": "violation_unpaid", "passed": False, "message": "التمديد متاح فقط للمخالفات غير المسددة"})
                        return results, False, "المخالفة غير مسددة"
                    if (viol.meta or {}).get("extension_requested"):
                        results.append({"check": "violation_already_extended", "passed": False, "message": "تم طلب التمديد مسبقاً"})
                        return results, False, "تم طلب التمديد مسبقاً"
                    age = days_since(viol.violation_datetime)
                    if age is not None and age > 45:
                        results.append({"check": "violation_window", "passed": False, "message": "التجاوز عن مدة التمديد المسموحة (45 يوم)"})
                        return results, False, "انتهت مدة التمديد"
                if service_code == "traffic_violation_objection":
                    if (viol.meta or {}).get("objection_submitted"):
                        results.append({"check": "violation_already_objected", "passed": False, "message": "تم تقديم اعتراض سابق"})
                        return results, False, "اعتراض سابق موجود"
                    age = days_since(viol.violation_datetime)
                    if age is not None and age > 30:
                        results.append({"check": "violation_objection_window", "passed": False, "message": "الاعتراض متاح خلال 30 يوماً من المخالفة"})
                        return results, False, "انتهت مدة الاعتراض"
        else:
            results.append({"check": "violation_number", "passed": False, "message": "رقم المخالفة مفقود"})
            return results, False, "رقم المخالفة مفقود"

    if service_code == "traffic_accident_objection_or_waiver":
        accident_number = collected.get("accident_number")
        if accident_number:
            with Session(engine) as session:
                acc = get_accident_by_number(session, user_id, accident_number)
                if not acc:
                    results.append({"check": "accident_exists", "passed": False, "message": "الحادث غير موجود"})
                    return results, False, "الحادث غير موجود"
                if (acc.meta or {}).get("objection_or_waiver"):
                    results.append({"check": "accident_already_processed", "passed": False, "message": "تم الاعتراض/التنازل مسبقاً"})
                    return results, False, "طلب سابق موجود"
                age = days_since(acc.accident_date)
                if age is not None and age > 10:
                    results.append({"check": "accident_window", "passed": False, "message": "الاعتراض/التنازل متاح خلال 10 أيام من تقرير الحادث"})
                    return results, False, "انتهت مدة الاعتراض"
        else:
            results.append({"check": "accident_number", "passed": False, "message": "رقم الحادث مفقود"})
            return results, False, "رقم الحادث مفقود"

    if service_code == "traffic_accident_report":
        accident_number = collected.get("accident_number")
        if accident_number:
            with Session(engine) as session:
                acc = get_accident_by_number(session, user_id, accident_number)
                if not acc:
                    results.append({"check": "accident_exists", "passed": False, "message": "الحادث غير موجود"})
                    return results, False, "الحادث غير موجود"
                if (acc.meta or {}).get("report_issued"):
                    results.append({"check": "report_exists", "passed": False, "message": "تم إصدار التقرير مسبقاً"})
                    return results, False, "تم إصدار التقرير مسبقاً"
                age = days_since(acc.accident_date)
                if age is not None and age > 30:
                    results.append({"check": "accident_report_window", "passed": False, "message": "إصدار التقرير متاح خلال 30 يوم من الحادث"})
                    return results, False, "انتهت مدة إصدار التقرير"
        else:
            results.append({"check": "accident_number", "passed": False, "message": "رقم الحادث مفقود"})
            return results, False, "رقم الحادث مفقود"

    # License/ID renewal window checks
    if service_code == "renew_driving_license":
        # Expect renewal_duration provided; check that expiry is within 180 days if available in DrivingLicense metadata (not modeled deeply here)
        results.append({"check": "license_window", "passed": True, "message": "تم قبول طلب التجديد"})

    if service_code == "national_id_renewal":
        # Check if days to expiry <= 180 when available in metadata (not modeled deeply here)
        results.append({"check": "id_window", "passed": True, "message": "تم قبول طلب التجديد"})

    if service_code in ("national_id_issue_family_member", "national_id_replacement_lost", "national_id_replacement_damaged"):
        results.append({"check": "id_request", "passed": True, "message": "تم قبول الطلب"})

    results.append({"check": "general", "passed": True, "message": "ok"})
    return results, human_required, pause_reason
    results.append({"check": "general", "passed": True, "message": "ok"})
    return results, human_required, pause_reason


# ---------- Actions dispatcher ----------
def execute_service_action(user_id: Optional[int], service_code: str, req: Dict[str, Any], collected: Dict[str, Any]) -> Dict[str, Any]:
    payment_info = req.get("payment") or {}
    requires_payment = req.get("requires_payment", False) or bool(payment_info)
    fee = 0
    if payment_info:
        if "fee" in payment_info:
            fee = int(payment_info["fee"])
        elif "fee_by_duration" in payment_info and "renewal_duration" in collected:
            fee = int(payment_info["fee_by_duration"].get(str(collected["renewal_duration"]), 0))

    if user_id is None:
        return {"status": "error", "message": "المستخدم غير معروف"}

    with Session(engine) as session:
        # Special handling: use violation amount as fee
        if service_code == "traffic_violation_payment":
            vnum = collected.get("violation_number")
            viol = get_violation_by_number(session, user_id, vnum) if vnum else None
            if not viol:
                return {"status": "error", "message": "المخالفة غير موجودة"}
            fee = int(viol.amount or 0)

        if requires_payment and fee > 0:
            debit_wallet(session, user_id, fee, reference=service_code)
            record_payment(session, user_id, fee, reference=service_code)

        result: Dict[str, Any] = {"status": "success", "service_code": service_code, "fee_charged": fee}

        # ----- Domain side-effects -----
        # Violations: extend payment window or submit objection
        if service_code == "traffic_violation_payment_extension":
            vnum = collected.get("violation_number")
            viol = get_violation_by_number(session, user_id, vnum) if vnum else None
            if viol:
                meta = viol.meta or {}
                meta["extension_requested"] = True
                meta["extension_requested_at"] = dt.datetime.utcnow().isoformat()
                viol.meta = meta
                session.add(viol)
                session.commit()
                result["violation_number"] = vnum

        elif service_code == "traffic_violation_objection":
            vnum = collected.get("violation_number")
            viol = get_violation_by_number(session, user_id, vnum) if vnum else None
            if viol:
                meta = viol.meta or {}
                meta["objection_submitted"] = True
                meta["objection_reason"] = collected.get("objection_reason")
                meta["objection_submitted_at"] = dt.datetime.utcnow().isoformat()
                viol.meta = meta
                session.add(viol)
                session.commit()
                result["violation_number"] = vnum

        elif service_code == "traffic_violation_payment":
            vnum = collected.get("violation_number")
            viol = get_violation_by_number(session, user_id, vnum) if vnum else None
            if viol:
                viol.payment_status = "paid"
                session.add(viol)
                session.commit()
                result["violation_number"] = vnum

        # Accident report
        elif service_code == "traffic_accident_report":
            anum = collected.get("accident_number")
            acc = get_accident_by_number(session, user_id, anum) if anum else None
            if acc:
                meta = acc.meta or {}
                meta["report_issued"] = True
                meta["report_issued_at"] = dt.datetime.utcnow().isoformat()
                acc.meta = meta
                session.add(acc)
                session.commit()
                result["accident_number"] = anum

        # Accident objection/waiver
        elif service_code == "traffic_accident_objection_or_waiver":
            anum = collected.get("accident_number")
            acc = get_accident_by_number(session, user_id, anum) if anum else None
            if acc:
                meta = acc.meta or {}
                meta["objection_or_waiver"] = collected.get("objection_type", "objection")
                meta["objection_or_waiver_at"] = dt.datetime.utcnow().isoformat()
                acc.meta = meta
                session.add(acc)
                session.commit()
                result["accident_number"] = anum

        # License renewal: mark DL status/expiry bump in metadata (light)
        elif service_code == "renew_driving_license":
            # This is a placeholder effect; real renewal would update DrivingLicense
            result["renewal_duration"] = collected.get("renewal_duration")

        # ID services: record intent in result; wallet already charged
        elif service_code in (
            "national_id_issue_family_member",
            "national_id_renewal",
            "national_id_replacement_lost",
            "national_id_replacement_damaged",
        ):
            result["id_request"] = "submitted"

        return result

