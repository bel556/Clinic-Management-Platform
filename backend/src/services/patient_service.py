import re
from datetime import datetime

from src.repository import patients as repo

UNSET = object()
_UPCOMING_STATUSES = {'upcoming', 'scheduled'}


# normalization & business helpers (no validation)

def _clean_str(value):
    if value is None:
        return None
    text = ' '.join(value.split())
    return text if text else None


def _normalize_phone(value):
    if value is None:
        return None
    return re.sub(r'[\s\-().]', '', value.strip())


def _as_date(value):
    return value.date() if isinstance(value, datetime) else value

def _find_duplicate(conn, full_name, phone, birth_date, exclude_id=None):
    key = full_name.lower()
    for p in repo.get_patients_by_phone(conn, phone, 200) or []:
        if p['patient_id'] != exclude_id and p['phone'] == phone \
                and p['full_name'].lower() == key:
            return p
    for p in repo.get_patients_by_name(conn, full_name, 200) or []:
        if p['patient_id'] != exclude_id and p['full_name'].lower() == key \
                and _as_date(p['birth_date']) == _as_date(birth_date):
            return p
    return None

def create_patient(conn, first_name, last_name, birth_date, phone, gender,
                   email=None, additional_info=None, emergency_contact=None):
    full_name = f"{_clean_str(first_name)} {_clean_str(last_name)}"
    phone = _normalize_phone(phone)
    gender = _clean_str(gender).lower()
    email = _clean_str(email)
    if email:
        email = email.lower()
    additional_info = _clean_str(additional_info)
    emergency_contact = _clean_str(emergency_contact)

    existing = _find_duplicate(conn, full_name, phone, birth_date)
    if existing:
        raise ValueError(f"Patient already exists (ID {existing['patient_id']})")

    new_id = repo.create_patient(
        conn, full_name, birth_date, phone, gender,
        email, additional_info, emergency_contact
    )
    if new_id is None:
        raise RuntimeError("Failed to create patient")

    return repo.get_patient_by_id(conn, new_id)

def update_patient(conn, patient_id, first_name=UNSET, last_name=UNSET,
                   birth_date=UNSET, phone=UNSET, email=UNSET,
                   additional_info=UNSET):
    current = repo.get_patient_by_id(conn, patient_id)
    if current is None:
        return None

    old_first, _, old_last = current['full_name'].partition(' ')
    new_first = old_first if first_name is UNSET else _clean_str(first_name)
    new_last = old_last if last_name is UNSET else _clean_str(last_name)
    new_full_name = f"{new_first} {new_last}".strip()

    new_birth = current['birth_date'] if birth_date is UNSET else birth_date
    new_phone = current['phone'] if phone is UNSET else _normalize_phone(phone)
    new_email = current.get('email') if email is UNSET else _clean_str(email)
    if new_email:
        new_email = new_email.lower()
    new_info = current.get('additional_info') if additional_info is UNSET else _clean_str(additional_info)

    if (new_full_name != current['full_name'] or new_phone != current['phone']
            or _as_date(new_birth) != _as_date(current['birth_date'])):
        other = _find_duplicate(conn, new_full_name, new_phone, new_birth, exclude_id=patient_id)
        if other:
            raise ValueError(f"Another patient already has these details (ID {other['patient_id']})")

    changes = [
        ('name', new_full_name, current['full_name'], repo.modify_patient_name),
        ('birth date', _as_date(new_birth), _as_date(current['birth_date']), repo.modify_patient_birth_date),
        ('phone', new_phone, current['phone'], repo.modify_patient_phone),
        ('email', new_email, current.get('email'), repo.modify_patient_email),
        ('additional info', new_info, current.get('additional_info'), repo.modify_patient_additional_info),
    ]
    for label, new, old, writer in changes:
        if new != old and not writer(conn, patient_id, new):
            raise RuntimeError(f"Failed to update patient {label}")

    return repo.get_patient_by_id(conn, patient_id)

def get_patient_info(conn, patient_id):
    return repo.get_patient_by_id(conn, patient_id)


def get_patient_visits(conn, patient_id):
    patient = repo.get_patient_by_id(conn, patient_id)
    if patient is None:
        return None

    visits = repo.get_patient_visits(conn, patient_id) or []
    return {
        'patient_id': patient_id,
        'upcoming': [v for v in visits if v['status'] in _UPCOMING_STATUSES],
        'history': [v for v in visits if v['status'] not in _UPCOMING_STATUSES],
    }

def search_patients(conn, query, limit=50):
    q = _clean_str(query)
    if not q:
        return []

    found = {}
    upper = q.upper()
    if upper.startswith('P-') and upper[2:].isdigit():
        p = repo.get_patient_by_id(conn, int(upper[2:]))
        if p:
            found[p['patient_id']] = p
    elif q.isdigit() or (q.startswith('+') and q[1:].isdigit()):
        if q.isdigit() and int(q) > 0:
            p = repo.get_patient_by_id(conn, int(q))
            if p:
                found[p['patient_id']] = p
        for p in repo.get_patients_by_phone(conn, q, limit) or []:
            found.setdefault(p['patient_id'], p)
    else:
        for p in repo.get_patients_by_name(conn, q, limit) or []:
            found.setdefault(p['patient_id'], p)

    return list(found.values())[:limit]

def delete_patient(conn, patient_id):
    patient = repo.get_patient_by_id(conn, patient_id)
    if patient is None:
        return None

    visits = repo.get_patient_visits(conn, patient_id) or []
    if visits:
        raise ValueError(f"Cannot delete patient with {len(visits)} existing visit(s)")

    if not repo.delete_patient(conn, patient_id):
        raise RuntimeError("Failed to delete patient")

    return {'patient_id': patient_id, 'full_name': patient['full_name'], 'deleted': True}