# Clinic-Management-Platform

Full-stack clinic management platform: **FastAPI + MySQL** backend, **React 19 + Vite** frontend.

```
backend/    FastAPI service (patients, doctors, visits, queue, consultations, notifications)
frontend/   React SPA for reception and doctor roles
```

## Quick start (full stack)

**1. Database**

Local MySQL:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS clinic"
mysql -u root -p clinic < backend/schema.sql
mysql -u root -p clinic < backend/seed.sql
```

Hosted TiDB Cloud Serverless: point `backend/.env` at the cluster gateway and keep
the session on the clinic's local day:

```env
db_host=gateway01.<region>.prod.aws.tidbcloud.com
db_port=4000
db_user=<prefix>.root
db_password=<password>
db_database=Clinic_Db
db_time_zone=+01:00
db_pool_size=5
```

The connector negotiates TLS automatically. Run the migration block from
`backend/README.md` if the hosted schema predates the current code. `seed.sql` is
only for demo/local use — never run it against a shared hosted database.

**2. Backend**

```bash
cd backend
uv sync
cp .env.example .env      # set db_user / db_password / db_database
uv run uvicorn src.main:app --reload
```

- API: <http://localhost:8000>
- Swagger UI: <http://localhost:8000/docs>
- Health: <http://localhost:8000/health>

**3. Frontend**

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

The frontend talks to `http://localhost:8000` by default. Override with
`frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_DATA_SOURCE=api
```

## Demo-only mode (no database)

The in-memory demo database is still available and needs nothing running:

```bash
cd frontend
VITE_DATA_SOURCE=mock npm run dev
```

## Architecture

Each domain exposes the same functions in both modes:

```
services/<domain>.js        selector (reads VITE_DATA_SOURCE)
services/mock/<domain>.js   in-memory implementation (demo)
services/api/<domain>.js    FastAPI implementation
services/adapters.js        snake_case / integer / enum DTOs → view models
```

Components are unaware of the switch; `utils/format.js` (`now()`, `patientRef()`,
`visitRef()`) adapts display to the active source. Failed API calls are reported
through `services/events.js` and surface as error toasts; `<ErrorPane>` handles
failed screen loads and `<ErrorBoundary>` catches render errors.

## Data model highlights

- `PATIENT` stores `blood_type`, newline-separated `allergies` and `conditions`,
  plus `additional_info` / `emergency_contact`; the patient form edits them and
  the profile renders them directly.
- `VISIT` stores `reason`, `slot`, `checked_in_at` and `completed_at`; the queue
  wait times and the doctor's daily KPIs are computed from these timestamps.
- Queue positions are scoped to `(doctor, queue_day)` and renumbered when a
  visit leaves the queue.
- `MEDICALNOTE.is_draft` backs consultation drafts; publishing a draft clears
  the draft flag.
- `NOTIFICATION.created_at` provides the real alert time.
- Doctor profiles (`npi`, `license_no`, `slot_length_minutes`, email, phone,
  room) and employee presence come from `DOCTOR` / `EMPLOYEE`, not constants.

## Known limitations

- **Authentication is not implemented.** `backend/src/auth/` is empty, every
  endpoint is public, and the login screen only switches workspaces. Do not
  expose the API outside a trusted network.
- Doctor availability is presence (`present`/`absent`) plus a week range; the
  slot grid marks slots that already have visits, it is not a separate
  availability table.
- Deleting a visit is not supported: the UI cancels it instead.

## Notes

- Queue positions are scoped to `(doctor, day)` and renumbered when a visit
  leaves the queue.
- Consultation drafts live in `MEDICALNOTE.is_draft`.
- `PATCH /visits/{id}` accepts `financial_status`, `reason` and `slot`.
