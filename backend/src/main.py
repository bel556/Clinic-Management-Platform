from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.endpoints.patients import patient_router
from src.endpoints.doctors import doctor_router
from src.endpoints.visits import visit_router
from src.endpoints.notifications import notification_router
from src.endpoints.consultation import consultation_router
from src.endpoints.employees import employee_router

app = FastAPI(title="Clinic Management API")


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient_router, tags=["Patients"])
app.include_router(doctor_router, tags=["Doctors"])
app.include_router(visit_router, tags=["Visits"])
app.include_router(notification_router, tags=["Notifications"])
app.include_router(consultation_router, tags=["Consultation & Medical Notes"])
app.include_router(employee_router, tags=["Employees"])
