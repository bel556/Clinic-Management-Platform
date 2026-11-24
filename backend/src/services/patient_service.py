"""Patient business logic.

Return conventions:
  create_patient       -> dict  (the new patient)
  update_patient       -> dict  (the updated patient)
  get_patient_info     -> dict
  get_patient_visits   -> dict  {'patient_id', 'upcoming': [...], 'history': [...]}
  search_patients      -> list  (empty list when nothing matches)
  delete_patient       -> dict  {'patient_id', 'full_name', 'deleted': True}

Failures raise: ValidationError (bad input), NotFoundError (no such patient),
ConflictError (duplicate, or patient has visits), ServiceError (database failed).
"""
import re
from datetime import date, datetime

from src.repository import patients as repo
from src.services.constants import GENDERS, UPCOMING
from src.services.errors import (
    ConflictError, NotFoundError, ServiceError, ValidationError,
)

UNSET = object()   # "argument not given" (so None can mean "clear this field")

_UPCOMING_STATUSES = {UPCOMING, 'scheduled'}   # 'scheduled' = current DB default
_EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
_PHONE_RE = re.compile(r'^\+?\d{9,15}$')
_MAX_AGE_YEARS = 130


#  helpers

def _parse_patient_id(value):
    """Accepts 160, '160', 'P-000160'. Returns a positive int."""
    if isinstance(value, bool):
        raise ValidationError('Invalid patient ID')
    if isinstance(value, int):
        pid = value
    elif isinstance(value, str):
        text = value.strip().upper()
        if text.startswith('P-'):
            text = text[2:]
        if not text.isdigit():
            raise ValidationError('Invalid patient ID')
        pid = int(text)
    else:
        raise ValidationError('Invalid patient ID')
    if pid <= 0:
        raise ValidationError('Invalid patient ID')
    return pid


def _clean_name(value, label):
    if not isinstance(value, str):
        raise ValidationError(f'{label} is required')
    text = ' '.join(value.split())            # trim + collapse spaces
    if not text:
        raise ValidationError(f'{label} is required')
    if len(text) > 100:
        raise ValidationError(f'{label} is too long')
    if not any(ch.isalpha() for ch in text):
        raise ValidationError(f'{label} must contain letters')
    return text


def _clean_phone(value):
    if not isinstance(value, str):
        raise ValidationError('Phone number is required')
    text = re.sub(r'[\s\-().]', '', value)
    if not _PHONE_RE.match(text):
        raise ValidationError('Invalid phone number (9 to 15 digits)')
    return text


def _clean_gender(value):
    if not isinstance(value, str) or value.strip().lower() not in GENDERS:
        raise ValidationError(f'Gender must be one of: {", ".join(GENDERS)}')
    return value.strip().lower()


def _as_date(value):
    return value.date() if isinstance(value, datetime) else value


def _parse_birth_date(value):
    if isinstance(value, datetime):
        value = value.date()
    elif isinstance(value, str):
        try:
            value = date.fromisoformat(value.strip())
        except ValueError:
            raise ValidationError('Birth date must be in YYYY-MM-DD format')
    elif not isinstance(value, date):
        raise ValidationError('Birth date is required')
    today = date.today()
    if value > today:
        raise ValidationError('Birth date cannot be in the future')
    if value.year < today.year - _MAX_AGE_YEARS:
        raise ValidationError('Birth date is not realistic')
    return value


def _clean_email(value):
    """None or blank -> None (no email)."""
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValidationError('Invalid email')
    text = value.strip()
    if not text:
        return None
    if len(text) > 255 or not _EMAIL_RE.match(text):
        raise ValidationError('Invalid email')
    return text


def _clean_text(value, label, max_len=1000):
    """None or blank -> None."""
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValidationError(f'Invalid {label}')
    text = value.strip()
    if not text:
        return None
    if len(text) > max_len:
        raise ValidationError(f'{label} is too long')
    return text


def _get_or_404(conn, patient_id):
    patient = repo.get_patient_by_id(conn, patient_id)
    if patient is None:
        raise NotFoundError(f'Patient {patient_id} not found')
    return patient


def _find_duplicate(conn, full_name, phone, birth_date, exclude_id=None):
    """A patient is a duplicate if another patient has the same name AND
    (the same phone OR the same birth date). Family members sharing a phone
    but with different names are allowed."""
    key = full_name.lower()
    for p in repo.get_patients_by_phone(conn, phone, 200):
        if p['patient_id'] != exclude_id and p['phone'] == phone \
                and p['full_name'].lower() == key:
            return p
    for p in repo.get_patients_by_name(conn, full_name, 200):
        if p['patient_id'] != exclude_id and p['full_name'].lower() == key \
                and _as_date(p['birth_date']) == birth_date:
            return p
    return None


#  create patient

def create_patient(conn, first_name, last_name, birth_date, phone, gender,
                   email=None, additional_info=None, emergency_contact=None):
    first = _clean_name(first_name, 'First name')
    last = _clean_name(last_name, 'Last name')
    full_name = f'{first} {last}'
    birth_date = _parse_birth_date(birth_date)
    phone = _clean_phone(phone)
    gender = _clean_gender(gender)
    email = _clean_email(email)
    additional_info = _clean_text(additional_info, 'Additional info')
    emergency_contact = _clean_text(emergency_contact, 'Emergency contact', 255)

    # does he already exist?
    existing = _find_duplicate(conn, full_name, phone, birth_date)
    if existing:
        raise ConflictError(
            f'Patient already exists (ID {existing["patient_id"]}: {existing["full_name"]})')

    new_id = repo.create_patient(conn, full_name, birth_date, phone, gender,
                                 email, additional_info, emergency_contact)
    if new_id is None:
        raise ServiceError('Could not create the patient (database error)')
    return _get_or_404(conn, new_id)


# modify patient info

def update_patient(conn, patient_id, first_name=UNSET, last_name=UNSET,
                   birth_date=UNSET, phone=UNSET, email=UNSET,
                   additional_info=UNSET):
    """Pass only the fields to change. For email / additional_info, passing
    None or '' clears the value."""
    pid = _parse_patient_id(patient_id)
    current = _get_or_404(conn, pid)

    given = [first_name, last_name, birth_date, phone, email, additional_info]
    if all(v is UNSET for v in given):
        raise ValidationError('Nothing to update')

    # 1) validate everything first
    old_first, _, old_last = current['full_name'].partition(' ')
    new_first = old_first if first_name is UNSET else _clean_name(first_name, 'First name')
    new_last = old_last if last_name is UNSET else _clean_name(last_name, 'Last name')
    new_full_name = f'{new_first} {new_last}'.strip()
    new_birth = _as_date(current['birth_date']) if birth_date is UNSET \
        else _parse_birth_date(birth_date)
    new_phone = current['phone'] if phone is UNSET else _clean_phone(phone)
    new_email = current.get('email') if email is UNSET else _clean_email(email)
    new_info = current.get('additional_info') if additional_info is UNSET \
        else _clean_text(additional_info, 'Additional info')

    # 2) would the change collide with another patient?
    if (new_full_name != current['full_name'] or new_phone != current['phone']
            or new_birth != _as_date(current['birth_date'])):
        other = _find_duplicate(conn, new_full_name, new_phone, new_birth, exclude_id=pid)
        if other:
            raise ConflictError(
                f'Another patient already has these details (ID {other["patient_id"]})')

    # 3) what really changed
    changes = [
        ('name', new_full_name, current['full_name'], repo.modify_patient_name),
        ('birth date', new_birth, _as_date(current['birth_date']), repo.modify_patient_birth_date),
        ('phone', new_phone, current['phone'], repo.modify_patient_phone),
        ('email', new_email, current.get('email'), repo.modify_patient_email),
        ('additional info', new_info, current.get('additional_info'),
         repo.modify_patient_additional_info),
    ]
    for label, new, old, writer in changes:
        if new != old and not writer(conn, pid, new):
            raise ServiceError(f'Could not update the {label} (database error)')

    return _get_or_404(conn, pid)


# see patient's profile

def get_patient_info(conn, patient_id):
    return _get_or_404(conn, _parse_patient_id(patient_id))


def get_patient_visits(conn, patient_id):
    pid = _parse_patient_id(patient_id)
    _get_or_404(conn, pid)
    visits = repo.get_patient_visits(conn, pid) or []
    return {
        'patient_id': pid,
        'upcoming': [v for v in visits if v['status'] in _UPCOMING_STATUSES],
        'history': [v for v in visits if v['status'] not in _UPCOMING_STATUSES],
    }


#  search patients by name, id, phone

def search_patients(conn, query, limit=50):
    if not isinstance(query, str):
        raise ValidationError('Search text must be a string')
    if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 200:
        raise ValidationError('Limit must be between 1 and 200')
    q = ' '.join(query.split())
    if not q:
        return []

    found = {}                                     # patient_id -> patient (keeps order)
    upper = q.upper()
    if upper.startswith('P-') and upper[2:].isdigit():          # 'P-000160'
        p = repo.get_patient_by_id(conn, int(upper[2:]))
        if p:
            found[p['patient_id']] = p
    elif q.isdigit() or (q.startswith('+') and q[1:].isdigit()):  # id or phone
        if q.isdigit() and int(q) > 0:
            p = repo.get_patient_by_id(conn, int(q))
            if p:
                found[p['patient_id']] = p
        for p in repo.get_patients_by_phone(conn, q, limit):
            found.setdefault(p['patient_id'], p)
    else:                                                        # name
        for p in repo.get_patients_by_name(conn, q, limit):
            found.setdefault(p['patient_id'], p)
    return list(found.values())[:limit]


#  delete patient

def delete_patient(conn, patient_id):
    pid = _parse_patient_id(patient_id)
    patient = _get_or_404(conn, pid)                 # only delete if he exists

    visits = repo.get_patient_visits(conn, pid) or []
    if visits:
        raise ConflictError(
            f'Cannot delete: patient has {len(visits)} visit(s) on record')

    if not repo.delete_patient(conn, pid):
        raise ServiceError('Could not delete the patient (database error)')
    return {'patient_id': pid, 'full_name': patient['full_name'], 'deleted': True}