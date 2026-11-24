from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
from typing import Literal, Optional

VISIT_STATUS = Literal[
    'scheduled', 'upcoming', 'checked_in', 'present',
    'completed', 'done', 'missed', 'absent', 'cancelled',
]


class PatientCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    birth_date: date
    phone: str = Field(..., min_length=4, max_length=30)
    gender: str = Field(..., min_length=1, max_length=10)
    email: Optional[str] = None
    additional_info: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_type: Optional[str] = Field(None, max_length=5)
    allergies: Optional[str] = None
    conditions: Optional[str] = None


class PatientUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    birth_date: Optional[date] = None
    phone: Optional[str] = Field(None, min_length=4, max_length=30)
    gender: Optional[str] = Field(None, min_length=1, max_length=10)
    email: Optional[str] = None
    additional_info: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_type: Optional[str] = Field(None, max_length=5)
    allergies: Optional[str] = None
    conditions: Optional[str] = None


class VisitCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    patient_id: int
    doctor_id: int
    visit_date: datetime
    visit_type: str = Field(..., min_length=1, max_length=50)
    status: Optional[VISIT_STATUS] = "scheduled"
    financial_status: Optional[Literal['paid', 'unpaid']] = 'unpaid'
    reason: Optional[str] = Field(None, max_length=255)
    slot: Optional[str] = Field(None, max_length=50)


class VisitModify(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    visit_date: Optional[datetime] = None
    doctor_id: Optional[int] = None
    visit_type: Optional[str] = Field(None, min_length=1, max_length=50)
    status: Optional[VISIT_STATUS] = None
    financial_status: Optional[Literal['paid', 'unpaid']] = None
    reason: Optional[str] = Field(None, max_length=255)
    slot: Optional[str] = Field(None, max_length=50)


class NotificationCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    visit_id: int
    message: str = Field(..., min_length=1)


class DoctorAvailabilityUpdate(BaseModel):
    status: str = Field(..., pattern="^(present|absent)$")


class MedicalNoteCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    content: str = Field(..., min_length=1)
    is_draft: bool = False


class MedicalNoteUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    content: str = Field(..., min_length=1)
    is_draft: Optional[bool] = None
