# Clinic Management Platform API

FastAPI + MySQL backend for the clinic platform.

## Setup

```bash
cd backend
uv sync

# 1. Create the database (adjust host/user as needed)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS clinic"

# 2. Load schema + demo data
mysql -u root -p clinic < schema.sql
mysql -u root -p clinic < seed.sql

# 3. Configure credentials
cp .env.example .env   # then edit db_user / db_password / db_database

# 4. Run
uv run uvicorn src.main:app --reload
```

- API: <http://localhost:8000>
- Swagger UI: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/health>

The seed file uses dates relative to `CURDATE()`, so the reception board and the
doctor queue are populated on whatever day you import it.

## Schema upgrades

`schema.sql` creates every current column. If you already had an older database,
apply these once:

```sql
ALTER TABLE VISIT
  ADD COLUMN checked_in_at DATETIME NULL AFTER slot,
  ADD COLUMN completed_at DATETIME NULL AFTER checked_in_at;
ALTER TABLE PATIENT
  ADD COLUMN blood_type VARCHAR(5) NULL AFTER gender,
  ADD COLUMN allergies TEXT NULL AFTER additional_info,
  ADD COLUMN conditions TEXT NULL AFTER allergies;
ALTER TABLE DOCTOR
  ADD COLUMN slot_length_minutes INT NOT NULL DEFAULT 20 AFTER specialty,
  ADD COLUMN npi VARCHAR(20) NULL AFTER slot_length_minutes,
  ADD COLUMN license_no VARCHAR(50) NULL AFTER npi;
UPDATE VISIT SET checked_in_at = DATE_SUB(visit_date, INTERVAL 5 MINUTE)
  WHERE status IN ('checked_in', 'present');
UPDATE VISIT SET completed_at = DATE_ADD(visit_date, INTERVAL 25 MINUTE)
  WHERE status IN ('completed', 'done');
```

## Layout

```
src/
  main.py                 app + routers + CORS + /health
  schemas.py              Pydantic request models
  database/               env config + connection pool
  endpoints/              route handlers
  services/               business rules
  repository/             SQL
schema.sql                tables (run once)
seed.sql                  demo data (safe to re-run: truncates first)
```

## Endpoints

- Patients: list/search/get/create/update/delete, `/{id}/visits`
- Employees: list/filter, `/{id}`, `/{id}/availability` (GET/PATCH)
- Doctors: search/get, `/{id}/queue`, `/{id}/visits`, `/{id}/availability` (GET/PATCH)
- Visits: create, get, by-patient/status/date/type, `/{id}/queue`, `/{id}/details`,
  `/{id}/notes` (GET/POST), `PATCH /medical-notes/{id}`, cancel
- Notifications: list, create, mark read, read-all, delete

## Notes

- Queue positions are scoped to `(doctor, day)` and renumbered when a visit
  leaves the queue.
- `VISIT.checked_in_at` / `completed_at` are written by the service layer and
  drive wait times and daily KPIs.
- Consultation drafts live in `MEDICALNOTE.is_draft`.
- Auth is not implemented yet: every endpoint is open. Do not expose this
  service outside a trusted network until a login/JWT layer is added.
