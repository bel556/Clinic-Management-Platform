from src.repository import doctors as repo

def _clean_str(value):
    if value is None:
        return None
    text = ' '.join(value.split())
    return text if text else None

def get_doctor_info(conn, doctor_id):
    return repo.get_doctor_by_id(conn, doctor_id)


def search_doctors(conn, name=None, specialty=None, only_present=False):
    cleaned_name = _clean_str(name)
    if cleaned_name:
        return repo.get_doctors_by_name(conn, cleaned_name) or []

    cleaned_specialty = _clean_str(specialty)
    if cleaned_specialty:
        if only_present:
            return repo.get_present_doctors_by_specialty(conn, cleaned_specialty) or []
        return repo.get_doctors_by_specialty(conn, cleaned_specialty) or []

    if only_present:
        return [d for d in (repo.get_all_doctors(conn) or []) if d.get('availability_status') == 'present']

    return repo.get_all_doctors(conn) or []

def get_doctor_queue(conn, doctor_id):
    doctor = repo.get_doctor_by_id(conn, doctor_id)
    if doctor is None:
        return None

    queue = repo.get_doctor_queue(conn, doctor_id) or []
    return {
        'doctor_id': doctor_id,
        'doctor': doctor,
        'total_waiting': len(queue),
        'queue': queue,
    }

def get_doctor_visits(conn, doctor_id, visit_day=None):
    doctor = repo.get_doctor_by_id(conn, doctor_id)
    if doctor is None:
        return None

    visits = repo.get_doctor_visits(conn, doctor_id, visit_day=visit_day) or []
    return {
        'doctor_id': doctor_id,
        'visits': visits,
    }


def get_doctor_availability(conn, doctor_id):
    doctor = repo.get_doctor_by_id(conn, doctor_id)
    if doctor is None:
        return None
    return repo.get_doctor_availability(conn, doctor_id)


def set_doctor_availability(conn, doctor_id, status):
    doctor = repo.get_doctor_by_id(conn, doctor_id)
    if doctor is None:
        return None
    if not repo.update_doctor_availability(conn, doctor_id, status):
        raise RuntimeError("Failed to update doctor availability")
    return repo.get_doctor_availability(conn, doctor_id)
