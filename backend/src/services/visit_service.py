from datetime import datetime, date
from src.repository import visits.py


def create_visit_if_not_exists(conn, patient_id, doctor_id, visit_date,
                               visit_type, status='scheduled'):
    """Create a visit only if an identical non-cancelled one does not exist."""
    try:
        with conn.cursor() as cur:
            cur.execute(
                'select visit_id from VISIT '
                'where patient_id = %s and doctor_id = %s '
                'and visit_date = %s and visit_type = %s '
                'and status != %s',
                (patient_id, doctor_id, visit_date, visit_type, 'cancelled')
            )
            if cur.fetchone():
                return None
    except Exception:
        return None

    return visits.create_visit(
        conn, patient_id, doctor_id, visit_date, visit_type, status=status
    )

# ---------- Modify ----------

def modify_visit_info(conn, visit_id, visit_date=None, doctor_id=None,
                      visit_type=None, status=None):
    """
    Update any combination of fields by delegating to the existing
    single-field modify_* functions.
    """
    results = []
    if visit_date is not None:
        results.append(visits.modify_visit_date(conn, visit_id, visit_date))
    if doctor_id is not None:
        results.append(visits.modify_visit_doctor(conn, visit_id, doctor_id))
    if visit_type is not None:
        results.append(visits.modify_visit_type(conn, visit_id, visit_type))
    if status is not None:
        results.append(visits.modify_visit_status(conn, visit_id, status))

    if not results:
        return False
    return all(results)


#-------cancel------------

def cancel_visit(conn, visit_id):
    """Cancel a visit by delegating to modify_visit_status."""
    return visits.modify_visit_status(conn, visit_id, 'cancelled')


#-------search functions ------------


def search_visits_by_patient(conn, patient_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select v.*, p.full_name as patient_name, e.full_name as doctor_name '
            'from VISIT v '
            'join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'where v.patient_id = %s '
            'order by v.visit_date desc',
            (patient_id,)
        )
        return cur.fetchall()


def search_visits_by_status(conn, status, visit_day=None):
    """Delegates to get_visits_by_status."""
    return visits.get_visits_by_status(conn, status, visit_day)


def search_visits_by_date(conn, visit_day, statuses=('scheduled', 'in_progress',
                                                     'completed', 'cancelled')):
    """
    Return all visits on a given day across the given statuses.
    The repository API only supports status+day, so we fan out per status.
    """
    results = []
    for s in statuses:
        results.extend(visits.get_visits_by_status(conn, s, visit_day))
    results.sort(key=lambda v: v['visit_date'])
    return results


def search_visits_by_type(conn, visit_type):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select v.*, p.full_name as patient_name, e.full_name as doctor_name '
            'from VISIT v '
            'join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'where v.visit_type = %s '
            'order by v.visit_date',
            (visit_type,)
        )
        return cur.fetchall()


