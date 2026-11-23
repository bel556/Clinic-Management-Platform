from src.repository import visits
from src.repository import medicalnotes
from src.repository import patients  
import notification_service as notif_service


# ---------- Helpers ----------

def _remove_from_queue(conn, visit_id):
    """Helper to remove a visit from the QUEUE table."""
    with conn.cursor() as cur:
        cur.execute('SELECT visit_id FROM QUEUE WHERE visit_id = %s', (visit_id,))
        if not cur.fetchone():
            raise ValueError(f'Visit {visit_id} is not in the queue')
        cur.execute('DELETE FROM QUEUE WHERE visit_id = %s', (visit_id,))


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

    visit_id = visits.create_visit(
        conn, patient_id, doctor_id, visit_date, visit_type, status=status
    )
    
    if not visit_id:
        return None
        
    return visits.get_visit_by_id(conn, visit_id)


# ---------- Modify ----------

def modify_visit_status(conn, visit_id, new_status):
    """Modify visit status via repository and return updated record."""
    success = visits.modify_visit_status(conn, visit_id, new_status)
    if not success:
        return None
    return visits.get_visit_by_id(conn, visit_id)


def modify_visit_info(conn, visit_id, visit_date=None, doctor_id=None,
                      visit_type=None, status=None):
    """Update any combination of fields and return the updated record."""
    results = []
    if visit_date is not None:
        results.append(visits.modify_visit_date(conn, visit_id, visit_date))
    if doctor_id is not None:
        results.append(visits.modify_visit_doctor(conn, visit_id, doctor_id))
    if visit_type is not None:
        results.append(visits.modify_visit_type(conn, visit_id, visit_type))
    if status is not None:
        results.append(visits.modify_visit_status(conn, visit_id, status))

    if not results or not all(results):
        return None

    return visits.get_visit_by_id(conn, visit_id)


# ---------- Cancel ----------

def cancel_visit(conn, visit_id, notify=True):
    """
    Cancel a visit. Removes it from the QUEUE table.
    Raises an error if the visit is not in the queue.
    Sends a reception notification and returns the updated record.
    """
    try:
        _remove_from_queue(conn, visit_id)
        
        ok = visits.modify_visit_status(conn, visit_id, 'cancelled')
        if not ok:
            conn.rollback()
            return None

        conn.commit()

        if notify:
            try:
                notif_service.create_notification(conn, visit_id, f'Visit {visit_id} has been cancelled.')
            except Exception:
                pass

        return visits.get_visit_by_id(conn, visit_id)
        
    except ValueError:
        conn.rollback()
        return None
    except Exception:
        conn.rollback()
        return None


# ---------- Queue ----------

def get_visit_queue_number(conn, visit_id):
    """Get the queue position directly from the QUEUE table."""
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select position from QUEUE where visit_id = %s',
            (visit_id,)
        )
        row = cur.fetchone()
        
    if not row:
        return None
        
    return {'visit_id': visit_id, 'position': row['position']}


# ---------- Search ----------

def search_visits_by_patient(conn, patient_id):
    records = patients.get_patient_visits(conn, patient_id)
    return records if records else None


def search_visits_by_status(conn, status, visit_day=None):
    records = visits.get_visits_by_status(conn, status, visit_day)
    return records if records else None


def search_visits_by_date(conn, visit_day, statuses=('scheduled', 'present', 'absent', 'checked_in', 'completed', 'cancelled')):
    results = []
    for s in statuses:
        records = visits.get_visits_by_status(conn, s, visit_day)
        if records:
            results.extend(records)
            
    if not results:
        return None
        
    results.sort(key=lambda v: v['visit_date'])
    return results


def search_visits_by_type(conn, visit_type):
    """I added the function to the repo."""
    records = visits.get_visits_by_type(conn, visit_type)
    return records if records else None


# ---------- Doctor view ----------

def get_visit_details_for_doctor(conn, visit_id, doctor_id):
    """Full visit + medical notes , only if the visit belongs to the doctor."""
    visit = visits.get_visit_by_id(conn, visit_id)
    if not visit or visit['doctor_id'] != doctor_id:
        return None

    notes = medicalnotes.get_medical_notes_by_visit_id(conn, visit_id)
    visit['medical_notes'] = notes if notes else []
        
    return visit


# ---------- Doctor-driven changes ----------

def doctor_reschedule_visit(conn, visit_id, doctor_id, new_visit_date):
    """Doctor reschedules a visit..."""
    visit = visits.get_visit_by_id(conn, visit_id)
    if not visit or visit['doctor_id'] != doctor_id:
        return None

    old_date = visit['visit_date']
    if not visits.modify_visit_date(conn, visit_id, new_visit_date):
        return None

    try:
        notif_service.create_notification(
            conn, visit_id,
            f'Doctor changed visit {visit_id} date from {old_date} to {new_visit_date}.'
        )
    except Exception:
        pass

    return visits.get_visit_by_id(conn, visit_id)


def doctor_cancel_visit(conn, visit_id, doctor_id):
    """Doctor cancels a visit..."""
    visit = visits.get_visit_by_id(conn, visit_id)
    if not visit or visit['doctor_id'] != doctor_id:
        return None

    try:
        _remove_from_queue(conn, visit_id)
        
        if not visits.modify_visit_status(conn, visit_id, 'cancelled'):
            conn.rollback()
            return None
            
        conn.commit()

        notif_service.create_notification(conn, visit_id, f'Doctor cancelled visit {visit_id}.')
        
    except ValueError:
        conn.rollback()
        return None
    except Exception:
        conn.rollback()
        return None

    return visits.get_visit_by_id(conn, visit_id)
