from src.repository import visits
from src.repository import medicalnotes
from src.repository import patients
from src.repository import doctors
import notification_service as notif_service


# ---------- Helpers ----------

def _remove_from_queue(conn, visit_id, must_exist=True):
    """Helper to remove a visit from the QUEUE table and shift remaining positions."""
    with conn.cursor(dictionary=True) as cur:
        cur.execute('SELECT doctor_id, position FROM QUEUE WHERE visit_id = %s', (visit_id,))
        row = cur.fetchone()
        
        if not row:
            if must_exist:
                raise ValueError(f'Visit {visit_id} is not in the queue')
            return False  
            
        doctor_id = row['doctor_id']
        removed_position = row['position']
        
        visits.delete_visit(conn, visit_id)

    visits.decrease_queue_positions(conn, doctor_id, removed_position=removed_position)
    return True


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
        
    if status in ('checked_in', 'present'):
        visits.increase_queue_positions(conn, visit_id, doctor_id)
        
    return visits.get_visit_by_id(conn, visit_id)
                                   

# ---------- Modify ----------

def modify_visit_info(conn, visit_id, visit_date=None, doctor_id=None,
                      visit_type=None, status=None):
    """Update fields, handle queues, send notifications."""
    existing = visits.get_visit_by_id(conn, visit_id)
    if not existing:
        return None

    updates_made = False

    try:
        # 1. Date Change
        if visit_date is not None and visit_date != existing['visit_date']:
            if visits.modify_visit_date(conn, visit_id, visit_date):
                updates_made = True
                _remove_from_queue(conn, visit_id, must_exist=False)
                
                try:
                    notif_service.create_notification(
                        conn, visit_id, 
                        f'Doctor changed visit {visit_id} date from {existing["visit_date"]} to {visit_date}.'
                    )
                except Exception:
                    pass

        # 2. Status Change (with Queue logic for cancellation)
        if status is not None and status != existing['status']:
            # Update status FIRST
            if visits.modify_visit_status(conn, visit_id, status):
                updates_made = True
                
                # Handle Queue if cancelled
                if status == 'cancelled':
                    _remove_from_queue(conn, visit_id)
                
                try:
                    notif_service.create_notification(
                        conn, visit_id, 
                        f'Status of Visit {visit_id} has been changed to {status}.'
                    )
                except Exception:
                    pass

        # 3. Doctor Change
        if doctor_id is not None and doctor_id != existing['doctor_id']:
            if visits.modify_visit_doctor(conn, visit_id, doctor_id):
                updates_made = True
                
                doctor = doctors.get_doctor_by_id(conn, doctor_id)
                doctor_name = doctor['full_name'] if doctor else f"ID {doctor_id}"
                
                try:
                    notif_service.create_notification(
                        conn, visit_id, 
                        f'Doctor for Visit {visit_id} has been changed to Dr. {doctor_name}.'
                    )
                except Exception:
                    pass

        # 4. Visit Type Change
        if visit_type is not None and visit_type != existing['visit_type']:
            if visits.modify_visit_type(conn, visit_id, visit_type):
                updates_made = True
                try:
                    notif_service.create_notification(
                        conn, visit_id, 
                        f'Type of Visit {visit_id} has been changed to {visit_type}.'
                    )
                except Exception:
                    pass

        if not updates_made:
            return existing

        # Handle the deletion if it was cancelled
        if status == 'cancelled':
            visits.delete_visit(conn, visit_id)
            return {'visit_id': visit_id, 'status': 'cancelled', 'deleted': True}

        return visits.get_visit_by_id(conn, visit_id)
        
    except ValueError:
        conn.rollback() 
        return None
    except Exception:
        conn.rollback()
        return None


# ---------- Cancel ----------

def cancel_visit(conn, visit_id, notify=True):
    return modify_visit_info(conn, visit_id, status='cancelled')


# ---------- Queue ----------

def get_visit_queue_number(conn, visit_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute('select position from QUEUE where visit_id = %s', (visit_id,))
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
    records = visits.get_visits_by_type(conn, visit_type)
    return records if records else None


# ---------- Doctor view ----------

def get_visit_details_for_doctor(conn, visit_id, doctor_id):
    visit = visits.get_visit_by_id(conn, visit_id)
    if not visit or visit['doctor_id'] != doctor_id:
        return None

    notes = medicalnotes.get_medical_notes_by_visit_id(conn, visit_id)
    visit['medical_notes'] = notes if notes else []
        
    return visit
