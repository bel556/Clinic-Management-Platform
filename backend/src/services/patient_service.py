import re
from datetime import datetime
from src.repository import patients as repo

UNSET = object()
_UPCOMING_STATUSES = {'upcoming', 'scheduled', 'checked_in', 'present'}
_PHONE_QUERY = re.compile(r'^\+?[\d\s\-().]+$')

# normalize whitespace and return None if a value is missing or blank
def _clean_str(value):
    if value is None:
        return None
    text = ' '.join(str(value).split())
    return text if text else None

# strip non-digit characters except a leading plus sign from a phone string
def _normalize_phone(value):
    if value is None:
        return None
    return re.sub(r'[^\d+]', '', str(value).strip())

# extract only numeric digits from a phone value
def _phone_digits(value):
    return re.sub(r'\D', '', str(value or ''))

# normalize newline-separated lines and collapse whitespace, or return None if empty
def _clean_multiline(value):
    if value is None:
        return None
    lines = [' '.join(line.split()) for line in str(value).splitlines()]
    lines = [line for line in lines if line]
    return '\n'.join(lines) if lines else None

# convert a datetime instance to a date object or return the value as-is
def _as_date(value):
    return value.date() if isinstance(value, datetime) else value

# return a matching existing patient by phone or name and birth date, excluding one ID
def _find_duplicate(conn, full_name, phone, birth_date, exclude_id=None):
    key = full_name.lower()
    digits = _phone_digits(phone)
    for p in repo.get_patients_by_phone(conn, digits, 200) or []:
        if p['patient_id'] != exclude_id and _phone_digits(p['phone']) == digits \
                and p['full_name'].lower() == key:
            return p
    for p in repo.get_patients_by_name(conn, full_name, 200) or []:
        if p['patient_id'] != exclude_id and p['full_name'].lower() == key \
                and _as_date(p['birth_date']) == _as_date(birth_date):
            return p
    return None

# validate inputs, check for duplicates, and create a new patient record
def create_patient(conn, first_name, last_name, birth_date, phone, gender, email=None,
                   additional_info=None, emergency_contact=None, blood_type=None,
                   allergies=None, conditions=None):
    clean_first = _clean_str(first_name)
    clean_last = _clean_str(last_name)
    if not clean_first or not clean_last:
        raise ValueError("First and last name are required")
    full_name = f"{clean_first} {clean_last}"
    phone = _normalize_phone(phone)
    if not phone:
        raise ValueError("Phone number is required")
    gender = (_clean_str(gender) or '').lower()
    email = _clean_str(email)
    if email:
        email = email.lower()
    additional_info = _clean_str(additional_info)
    emergency_contact = _clean_str(emergency_contact)
    blood_type = _clean_str(blood_type)
    allergies = _clean_multiline(allergies)
    conditions = _clean_multiline(conditions)
    existing = _find_duplicate(conn, full_name, phone, birth_date)
    if existing:
        raise ValueError(f"Patient already exists (ID {existing['patient_id']})")
    new_id = repo.create_patient(
        conn, full_name, birth_date, phone, gender, email,
        additional_info, emergency_contact, blood_type, allergies, conditions,
    )
    if new_id is None:
        raise RuntimeError("Failed to create patient")
    return repo.get_patient_by_id(conn, new_id)

# validate and update an existing patient's fields while guarding against duplicates
def update_patient(conn, patient_id, first_name=UNSET, last_name=UNSET, birth_date=UNSET,
                   phone=UNSET, gender=UNSET, email=UNSET, additional_info=UNSET,
                   emergency_contact=UNSET, blood_type=UNSET, allergies=UNSET,
                   conditions=UNSET):
    current = repo.get_patient_by_id(conn, patient_id)
    if current is None:
        return None
    old_first, _, old_last = current['full_name'].partition(' ')
    new_first = old_first if first_name is UNSET else _clean_str(first_name)
    new_last = old_last if last_name is UNSET else _clean_str(last_name)
    if not new_first:
        raise ValueError("First name is required")
    new_full_name = f"{new_first} {new_last or ''}".strip()
    new_birth = current['birth_date'] if birth_date is UNSET else birth_date
    new_phone = current['phone'] if phone is UNSET else _normalize_phone(phone)
    if not new_phone:
        raise ValueError("Phone number is required")
    new_gender = current['gender'] if gender is UNSET else (_clean_str(gender) or '').lower()
    new_email = current.get('email') if email is UNSET else _clean_str(email)
    if new_email:
        new_email = new_email.lower()
    new_info = current.get('additional_info') if additional_info is UNSET else _clean_str(additional_info)
    new_emergency = (
        current.get('emergency_contact') if emergency_contact is UNSET else _clean_str(emergency_contact)
    )
    new_blood_type = (
        current.get('blood_type') if blood_type is UNSET else _clean_str(blood_type)
    )
    new_allergies = (
        current.get('allergies') if allergies is UNSET else _clean_multiline(allergies)
    )
    new_conditions = (
        current.get('conditions') if conditions is UNSET else _clean_multiline(conditions)
    )
    if (new_full_name != current['full_name']
            or _phone_digits(new_phone) != _phone_digits(current['phone'])
            or _as_date(new_birth) != _as_date(current['birth_date'])):
        other = _find_duplicate(conn, new_full_name, new_phone, new_birth, exclude_id=patient_id)
        if other:
            raise ValueError(f"Another patient already has these details (ID {other['patient_id']})")
    if not repo.update_patient(
        conn, patient_id, new_full_name, new_birth, new_phone, new_gender, new_email,
        new_info, new_emergency, new_blood_type, new_allergies, new_conditions,
    ):
        raise RuntimeError("Failed to update patient")
    return repo.get_patient_by_id(conn, patient_id)

# fetch a single patient's record by ID
def get_patient_info(conn, patient_id):
    return repo.get_patient_by_id(conn, patient_id)

# return a paginated and ordered list of patients
def get_all_patients(conn, limit=50, offset=0, order='name'):
    return repo.get_all_patients(conn, limit=limit, offset=offset, order=order) or []

# return a patient's upcoming and past visits, or None if the patient does not exist
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

# return patient details along with grouped upcoming and historical visits, or None if not found
def get_patient_overview(conn, patient_id):
    patient = repo.get_patient_by_id(conn, patient_id)
    if patient is None:
        return None
    visits = repo.get_patient_visits(conn, patient_id) or []
    return {
        'patient': patient,
        'upcoming': [v for v in visits if v['status'] in _UPCOMING_STATUSES],
        'history': [v for v in visits if v['status'] not in _UPCOMING_STATUSES],
    }

# search patients by P-ID, phone number, or name up to a result limit
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
        return list(found.values())
    looks_like_phone = bool(_PHONE_QUERY.match(q)) and any(ch.isdigit() for ch in q)
    if looks_like_phone:
        digits = _phone_digits(q)
        if digits and len(digits) <= 9:
            p = repo.get_patient_by_id(conn, int(digits))
            if p:
                found[p['patient_id']] = p
        for p in repo.get_patients_by_phone(conn, digits, limit) or []:
            found.setdefault(p['patient_id'], p)
    else:
        for p in repo.get_patients_by_name(conn, q, limit) or []:
            found.setdefault(p['patient_id'], p)
    return list(found.values())[:limit]

# delete a patient with no existing visits, or None if the patient does not exist
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