from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional



class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    birth_date: date
    phone: str = Field(..., min_length=4, max_length=30)
    gender: str = Field(..., min_length=1, max_length=10)
    email: Optional[str] = None
    additional_info: Optional[str] = None
    emergency_contact: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    additional_info: Optional[str] = None




class VisitCreate(BaseModel):
    patient_id: int
    doctor_id: int
    visit_date: datetime
    visit_type: str = Field(..., min_length=1, max_length=50)
    status: Optional[str] = "scheduled"


class VisitModify(BaseModel):
    visit_date: Optional[datetime] = None
    doctor_id: Optional[int] = None
    visit_type: Optional[str] = None
    status: Optional[str] = None



class DoctorSearch(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    only_present: bool = False


class NotificationCreate(BaseModel):
    visit_id: int
    message: str = Field(..., min_length=1)


class DoctorAvailabilityUpdate(BaseModel):
    status: str = Field(..., pattern="^(present|absent)$")


class MedicalNoteCreate(BaseModel):
    content: str = Field(..., min_length=1)


class MedicalNoteUpdate(BaseModel):
    content: str = Field(..., min_length=1)

