from __future__ import annotations

import datetime as dt
from typing import List, Optional

from pydantic import BaseModel


# ---------- Auth ----------


class LoginRequest(BaseModel):
    national_id: str
    pin: str


class LoginResponse(BaseModel):
    token: str
    expires_at: dt.datetime
    display_name: str


# ---------- Services & categories ----------


class ServiceCategorySchema(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: bool = True


class ServiceSeed(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    requires_payment: bool = False
    is_active: bool = True
    sort_order: Optional[int] = None
    avg_duration_sec: Optional[int] = None
    required_fields: dict = {}
    prerequisites: dict = {}
    permissions: dict = {}

# ---------- User profile ----------


class PassportSchema(BaseModel):
    passport_number: str
    issue_date: Optional[dt.date] = None
    expiry_date: Optional[dt.date] = None
    issue_place: Optional[str] = None
    status: Optional[str] = None
    metadata: dict = {}


class DrivingLicenseSchema(BaseModel):
    license_number: Optional[str] = None
    license_type: Optional[str] = None
    issue_date: Optional[dt.date] = None
    expiry_date: Optional[dt.date] = None
    blood_type: Optional[str] = None
    status: Optional[str] = None
    passport_number: Optional[str] = None
    personal_photo_url: Optional[str] = None
    restrictions: Optional[str] = None
    metadata: dict = {}


class UserProfile(BaseModel):
    national_id: str
    display_name: str
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
    has_hajj_record: Optional[bool] = None
    last_hajj_year: Optional[int] = None
    last_hajj_location: Optional[str] = None
    passports: List[PassportSchema] = []
    driving_licenses: List[DrivingLicenseSchema] = []
    family_members: List["FamilyMemberSchema"] = []
    travel_records: List["TravelRecordSchema"] = []
    workers: List["WorkerSchema"] = []


# ---------- Violations & accidents ----------


class ViolationSchema(BaseModel):
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
    payment_status: str = "unpaid"
    payment_date: Optional[dt.date] = None
    violation_datetime: Optional[dt.datetime] = None
    metadata: dict = {}


class TrafficAccidentSchema(BaseModel):
    accident_number: Optional[str] = None
    accident_date: Optional[dt.date] = None
    plate_number: Optional[str] = None
    metadata: dict = {}


# ---------- Travel records ----------


class TravelRecordSchema(BaseModel):
    exit_date: Optional[dt.date] = None
    return_date: Optional[dt.date] = None
    destination: Optional[str] = None
    metadata: dict = {}


# ---------- Family ----------


class FamilyMemberSchema(BaseModel):
    name: str
    relation: Optional[str] = None
    national_id: Optional[str] = None
    birth_place: Optional[str] = None
    birth_date: Optional[dt.date] = None
    metadata: dict = {}


# ---------- Workers ----------


class WorkerIssueSchema(BaseModel):
    type: str
    severity: str
    message: str
    icon: str
    expiryDate: Optional[str] = None
    expiredDays: Optional[int] = None
    cost: Optional[int] = None


class WorkerSchema(BaseModel):
    name: str
    nationality: str
    gender: Optional[str] = None
    profession: Optional[str] = None
    iqama_number: Optional[str] = None
    iqama_expiry: Optional[dt.date] = None
    passport_number: Optional[str] = None
    insurance_expiry: Optional[dt.date] = None
    contract_expiry: Optional[dt.date] = None
    travel_status: Optional[str] = None
    status: Optional[str] = None
    metadata: dict = {}
    issues: List[WorkerIssueSchema] = []
    totalCost: Optional[int] = None


# ---------- Health report (aligned with current frontend mock) ----------


class WorkerIssue(BaseModel):
    type: str
    severity: str
    message: str
    icon: str
    expiryDate: Optional[str] = None
    expiredDays: Optional[int] = None
    cost: Optional[int] = None


class WorkerItem(BaseModel):
    name: str
    nationality: str
    iqamaNumber: str
    issues: List[WorkerIssue]
    totalCost: int


class CategoryItem(BaseModel):
    name: str
    status: Optional[str] = None
    expiryDate: Optional[str] = None
    daysUntilExpiry: Optional[int] = None
    statusEmoji: Optional[str] = None
    plate: Optional[str] = None
    count: Optional[int] = None
    amount: Optional[int] = None


class HealthCategory(BaseModel):
    id: str
    name: str
    icon: str
    score: int
    status: str
    statusText: str
    updatedScore: Optional[int] = None
    updatedStatusText: Optional[str] = None
    items: List[CategoryItem | WorkerItem]


class FixingStep(BaseModel):
    step: int
    text: str
    duration: int


class SuccessDetails(BaseModel):
    transactionId: str
    resolvedIssues: int
    newInsuranceExpiry: str
    newIqamaExpiry: str


class HealthReportResponse(BaseModel):
    name: str
    nationalId: str
    overallScore: int
    initialStatus: str
    updatedScore: int
    updatedStatus: str
    categories: List[HealthCategory]
    fixingSteps: List[FixingStep]
    successDetails: SuccessDetails
