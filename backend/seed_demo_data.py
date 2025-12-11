from __future__ import annotations

import datetime as dt

from passlib.hash import pbkdf2_sha256
from sqlmodel import Session, select

from backend.db import engine, init_db
from backend.models import (
    User,
    Wallet,
    WalletTransaction,
    Violation,
    TrafficAccident,
    Vehicle,
    Payment,
)


def main() -> None:
    init_db()
    with Session(engine) as session:
        # User
        stmt = select(User).where(User.national_id == "1111")
        user = session.exec(stmt).first()
        if not user:
            user = User(
                national_id="1111",
                display_name="Demo User",
                hashed_pin=pbkdf2_sha256.hash("123456"),
                nationality="Saudi",
                gender="M",
                birth_city="Riyadh",
                birth_country="Saudi Arabia",
                birth_date=dt.date(1990, 1, 1),
                occupation="Engineer",
                social_status="Single",
                education_level="Bachelor",
                national_id_expiry=dt.date.today() + dt.timedelta(days=365 * 3),
                family_member_count=0,
                has_hajj_record=True,
                last_hajj_year=2018,
                last_hajj_location="Makkah",
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        # Wallet & transactions
        wallet = session.exec(select(Wallet).where(Wallet.user_id == user.id)).first()
        if not wallet:
            wallet = Wallet(user_id=user.id, balance=500_00)  # 500 SAR in halalas
            session.add(wallet)
            session.commit()
            session.refresh(wallet)

            tx = WalletTransaction(
                wallet_id=wallet.id,
                amount=500_00,
                type="top_up",
                reference="seed",
                status="completed",
            )
            session.add(tx)
            session.commit()

        # Violations
        if not session.exec(select(Violation).where(Violation.user_id == user.id)).first():
            viol1 = Violation(
                user_id=user.id,
                violation_name="Speeding",
                violation_number="V-1001",
                violation_type="speed",
                plate_number="ABC123",
                city="Riyadh",
                amount=300,
                payment_status="unpaid",
                violation_datetime=dt.datetime.utcnow() - dt.timedelta(days=10),
                meta={"details": "Speeding 20km over limit"},
            )
            viol2 = Violation(
                user_id=user.id,
                violation_name="Parking",
                violation_number="V-1002",
                violation_type="parking",
                plate_number="ABC123",
                city="Riyadh",
                amount=150,
                payment_status="paid",
                payment_date=dt.date.today() - dt.timedelta(days=20),
                violation_datetime=dt.datetime.utcnow() - dt.timedelta(days=25),
                meta={"details": "No-parking zone"},
            )
            session.add(viol1)
            session.add(viol2)
            session.commit()

        # Accidents
        if not session.exec(select(TrafficAccident).where(TrafficAccident.user_id == user.id)).first():
            acc = TrafficAccident(
                user_id=user.id,
                accident_number="A-9001",
                accident_date=dt.date.today() - dt.timedelta(days=5),
                plate_number="ABC123",
                meta={"report_issued": False},
            )
            session.add(acc)
            session.commit()

        # Vehicles
        if not session.exec(select(Vehicle).where(Vehicle.user_id == user.id)).first():
            vehicle = Vehicle(
                user_id=user.id,
                plate="ABC123",
                status="active",
                expiry_date=dt.date.today() + dt.timedelta(days=200),
                insurance_expiry=dt.date.today() + dt.timedelta(days=150),
                meta={"make": "Toyota", "model": "Camry", "year": 2020},
            )
            session.add(vehicle)
            session.commit()

        # Sample payment record
        if not session.exec(select(Payment).where(Payment.user_id == user.id)).first():
            payment = Payment(
                user_id=user.id,
                amount=100,
                status="success",
                reference="demo_payment",
                meta={"note": "seed payment"},
            )
            session.add(payment)
            session.commit()

    print("Database seeded with demo data.")


if __name__ == "__main__":
    main()

