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



# 4. Run
uv run uvicorn src.main:app --reload




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
