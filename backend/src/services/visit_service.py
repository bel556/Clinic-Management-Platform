from datetime import datetime

from src.repository import visits
from src.services import notifications as notif_service


# ---------- Create ----------

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

def modify_visit_status(conn, visit_id, new_status):
    """Modify visit status via repository; notification sent by callers that need it."""
    return visits.modify_visit_status(conn, visit_id, new_status)


def modify_visit_info(conn, visit_id, visit_date=None, doctor_id=None,
                      visit_type=None, status=None):
    """
    Update any combination of fields via the repository's single-field
    modify_* functions.
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


# ---------- Cancel ----------

def cancel_visit(conn, visit_id, notify=True):
    """
    Cancel a visit. By default creates a reception notification via the
    notification service so the desk is aware.
    """
    ok = visits.modify_visit_status(conn, visit_id, 'cancelled')
    if not ok:
        return False

    if notify:
        _notify_reception(conn, visit_id,
                          f'Visit {visit_id} has been cancelled.')
    return True


# ---------- Queue ----------

def get_visit_queue_number(conn, visit_id):
    """Get the queue position directly from the QUEUE table."""
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select position from QUEUE where visit_id = %s',
            (visit_id,)
        )
        row = cur.fetchone()
        return row['position'] if row else 0


# ---------- Search ----------

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
    return visits.get_visits_by_status(conn, status, visit_day)


def search_visits_by_date(conn, visit_day, statuses=('scheduled', 'present', 'absent', 'checked_in', 'completed', 'cancelled')):
    """Matches the ENUM statuses from the database diagram."""
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


# ---------- Doctor view ----------

def get_visit_details_for_doctor(conn, visit_id, doctor_id):
    """Full visit + medical notes, only if the visit belongs to the doctor."""
    visit = visits.get_visit_by_id(conn, visit_id)
    if not visit or visit['doctor_id'] != doctor_id:
        return None

    with conn.cursor(dictionary=True) as cur:
        # Corrected table name to MEDICALNOTE and removed non-existent note_date
        cur.execute(
            'select * from MEDICALNOTE where visit_id = %s',
            (visit_id,)
        )
        visit['medical_notes'] = cur.fetchall()
    return visit


# ---------- Doctor-driven changes (send notifications) ----------

def _notify_reception(conn, visit_id, message):
    """
    Wrapper around the notification service so failures don't silently
    break the caller's flow.
    """
    try:
        return notif_service.create_notification(conn, visit_id, message)
    except (ValueError, RuntimeError):
        return None


def doctor_reschedule_visit(conn, visit_id, doctor_id, new_visit_date):
    """
    Doctor reschedules a visit. Verifies ownership, updates the date,
    and sends a reception notification via the notification service.
    """
    visit = visits.get_visit_by_id(conn, visit_id)
    if not visit or visit['doctor_id'] != doctor_id:
        return False

    old_date = visit['visit_date']
    if not visits.modify_visit_date(conn, visit_id, new_visit_date):
        return False

    _notify_reception(
        conn, visit_id,
        f'Doctor changed visit {visit_id} date from {old_date} to {new_visit_date}.'
    )
    return True


def doctor_cancel_visit(conn, visit_id, doctor_id):
    """
    Doctor cancels a visit. Verifies ownership, marks it cancelled,
    and sends a reception notification via the notification service.
    """
    visit = visits.get_visit_by_id(conn, visit_id)
    if not visit or visit['doctor_id'] != doctor_id:
        return False

    if not visits.modify_visit_status(conn, visit_id, 'cancelled'):
        return False

    _notify_reception(conn, visit_id, f'Doctor cancelled visit {visit_id}.')
    return True
