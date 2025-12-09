from __future__ import annotations

import datetime as dt
from typing import Optional

from sqlmodel import JSON, Column, Field, Relationship, SQLModel


# ---------- Categories ----------


class ServiceCategory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    parent_id: Optional[int] = Field(default=None, foreign_key="servicecategory.id")
    sort_order: Optional[int] = None
    is_active: bool = True

    services: list["Service"] = Relationship(back_populates="category_rel")


# ---------- Core user/auth ----------

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    national_id: str = Field(index=True, unique=True)
    display_name: str
    hashed_pin: str
    nationality: Optional[str] = None
    gender: Optional[str] = None
    birth_city: Optional[str] = None
    birth_country: Optional[str] = None
    birth_date: Optional[dt.date] = None
    occupation: Optional[str] = None
    social_status: Optional[str] = None
    education_level: Optional[str] = None
    national_id_expiry: Optional[dt.date] = None
    family_member_count: Optional[int] = None
    has_hajj_record: bool = False
    last_hajj_year: Optional[int] = None
    last_hajj_location: Optional[str] = None
    created_at: dt.datetime = Field(default_factory=dt.datetime.utcnow)

    sessions: list["SessionToken"] = Relationship(back_populates="user")
    passports: list["Passport"] = Relationship(back_populates="user")
    driving_licenses: list["DrivingLicense"] = Relationship(back_populates="user")


class SessionToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(index=True, unique=True)
    user_id: int = Field(foreign_key="user.id")
    expires_at: dt.datetime

    user: Optional[User] = Relationship(back_populates="sessions")


# ---------- Services & requirements ----------

class Service(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    code: Optional[str] = Field(default=None, index=True, unique=True)
    description: Optional[str] = None
    category: Optional[str] = None  # legacy/free-text
    category_id: Optional[int] = Field(default=None, foreign_key="servicecategory.id", index=True)
    requires_payment: bool = False
    is_active: bool = True
    sort_order: Optional[int] = None
    avg_duration_sec: Optional[int] = None
    required_fields: dict = Field(
        default_factory=dict, sa_column=Column(JSON)
    )  # lightweight schema for agent UI
    prerequisites: dict = Field(default_factory=dict, sa_column=Column(JSON))  # e.g., other services
    permissions: dict = Field(default_factory=dict, sa_column=Column(JSON))  # e.g., scopes/roles

    requirements: list["ServiceRequirement"] = Relationship(back_populates="service")
    category_rel: Optional[ServiceCategory] = Relationship(back_populates="services")


class ServiceRequirement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    service_id: int = Field(foreign_key="service.id", index=True)
    field: str
    field_type: str
    is_required: bool = True
    validator: Optional[str] = None  # description or regex

    service: Optional[Service] = Relationship(back_populates="requirements")


# ---------- Domain entities ----------

class Passport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    passport_number: str
    issue_date: Optional[dt.date] = None
    expiry_date: Optional[dt.date] = None
    issue_place: Optional[str] = None
    status: Optional[str] = None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))

    user: Optional[User] = Relationship(back_populates="passports")


class DrivingLicense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    license_number: Optional[str] = None
    license_type: Optional[str] = None
    issue_date: Optional[dt.date] = None
    expiry_date: Optional[dt.date] = None
    blood_type: Optional[str] = None
    status: Optional[str] = None  # active, expired, suspended
    passport_number: Optional[str] = None
    personal_photo_url: Optional[str] = None
    restrictions: Optional[str] = None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))

    user: Optional[User] = Relationship(back_populates="driving_licenses")


class UserDocument(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    doc_type: str
    status: str
    expiry_date: Optional[dt.date] = None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Vehicle(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    plate: str
    status: str
    expiry_date: Optional[dt.date] = None
    insurance_expiry: Optional[dt.date] = None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Worker(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str
    nationality: str
    gender: Optional[str] = None
    profession: Optional[str] = None
    iqama_number: str
    iqama_expiry: Optional[dt.date] = None
    passport_number: Optional[str] = None
    insurance_expiry: Optional[dt.date] = None
    contract_expiry: Optional[dt.date] = None
    travel_status: Optional[str] = None
    status: str = "active"
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Violation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    violation_name: Optional[str] = None
    violation_number: Optional[str] = None
    violator_national_id: Optional[str] = None
    violation_type: Optional[str] = None
    plate_number: Optional[str] = None
    vehicle_make: Optional[str] = None
    registration_type: Optional[str] = None
    serial_number: Optional[str] = None
    city: Optional[str] = None
    authority: Optional[str] = None
    amount: int = 0
    payment_status: str = "unpaid"  # unpaid, paid
    payment_date: Optional[dt.date] = None
    violation_datetime: Optional[dt.datetime] = None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


class TrafficAccident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    accident_number: Optional[str] = None
    accident_date: Optional[dt.date] = None
    plate_number: Optional[str] = None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


class TravelRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    exit_date: Optional[dt.date] = None
    return_date: Optional[dt.date] = None
    destination: Optional[str] = None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


class FamilyMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str
    relation: Optional[str] = None
    national_id: Optional[str] = None
    birth_place: Optional[str] = None
    birth_date: Optional[dt.date] = None
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    amount: int
    status: str = "pending"  # pending, success, failed (mocked)
    reference: Optional[str] = Field(default=None, index=True)
    created_at: dt.datetime = Field(default_factory=dt.datetime.utcnow)
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))

class Wallet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, unique=True)
    balance: int = 0  # smallest currency unit (e.g., halalas)
    currency: str = "SAR"
    updated_at: dt.datetime = Field(default_factory=dt.datetime.utcnow)


class WalletTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    wallet_id: int = Field(foreign_key="wallet.id", index=True)
    amount: int  # positive for top-up, negative for debit
    type: str  # top_up, debit, refund
    reference: Optional[str] = None  # e.g., service code or invoice
    status: str = "completed"  # completed, pending, failed (for demo default completed)
    created_at: dt.datetime = Field(default_factory=dt.datetime.utcnow)
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Appointment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    service_id: Optional[int] = Field(default=None, foreign_key="service.id", index=True)
    location: Optional[str] = None
    scheduled_at: Optional[dt.datetime] = None
    status: str = "booked"
    metadata: dict = Field(default_factory=dict, sa_column=Column(JSON))


# ---------- Health reports & actions ----------


class HealthReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    score: int
    status: str
    summary: dict = Field(default_factory=dict, sa_column=Column(JSON))
    generated_at: dt.datetime = Field(default_factory=dt.datetime.utcnow)

    actions: list["Action"] = Relationship(back_populates="report")


class Action(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: Optional[int] = Field(default=None, foreign_key="healthreport.id", index=True)
    action_type: str
    status: str = "pending"
    cost: Optional[int] = None
    payload: dict = Field(default_factory=dict, sa_column=Column(JSON))
    result: dict = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: dt.datetime = Field(default_factory=dt.datetime.utcnow)

    report: Optional[HealthReport] = Relationship(back_populates="actions")
