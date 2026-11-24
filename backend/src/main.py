from fastapi import FastAPI
from src.endpoints.patients import patient_router
from src.endpoints.doctors import doctor_router
from src.endpoints.visits import visit_router
from src.endpoints.notifications import notification_router
from src.endpoints.consultation import consultation_router

app = FastAPI(title="Clinic Management API")

app.include_router(patient_router, tags=["Patients"])
app.include_router(doctor_router, tags=["Doctors"])
app.include_router(visit_router, tags=["Visits"])
app.include_router(notification_router, tags=["Notifications"])
app.include_router(consultation_router, tags=["Consultation & Medical Notes"])

