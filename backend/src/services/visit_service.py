import json
from datetime import datetime

from src.repository import visits
from src.repository import medicalnotes
from src.repository import patients
import src.services.notification_service as notif_service



def _remove_from_queue(conn, visit_id, must_exist=True):
    """Remove a visit from the QUEUE table; the repository renumbers the day."""
    queue_info = visits.get_queue_info(conn, visit_id)

    if not queue_info:
        if must_exist:
            raise ValueError(f'Visit {visit_id} is not in the queue')
        return False

    visits.delete_from_queue(conn, visit_id)
    return True



def create_visit_if_not_exists(conn, patient_id, doctor_id, visit_date,
                               visit_type, status='scheduled',
                               financial_status='unpaid', reason=None, slot=None):
    """Create a visit only if an identical non-cancelled one does not exist."""

    if visits.get_visits_with_doctor_cancelled(
        conn, patient_id, doctor_id, visit_date, visit_type
    ) is None:
        return None

    visit_id = visits.create_visit(
        conn, patient_id, doctor_id, visit_date, visit_type,
        status=status, financial_status=financial_status, reason=reason, slot=slot,
        checked_in_at=datetime.now() if status in ('checked_in', 'present') else None,
    )

    if not visit_id:
        return None

    if status in ('checked_in', 'present'):
        visits.increase_queue_positions(conn, visit_id, doctor_id)

    return visits.get_visit_details(conn, visit_id)



def modify_visit_info(conn, visit_id, visit_date=None, doctor_id=None,
                      visit_type=None, status=None, financial_status=None,
                      reason=None, slot=None):
    """Update fields, handle queues and notify reception.

    Date moves are allowed in both directions: a reschedule is a reschedule.
    """
    existing = visits.get_visit_by_id(conn, visit_id)
    if not existing:
        return None

    updates_made = False

    try:
        # 1. Date change
        if visit_date is not None and visit_date != existing['visit_date']:
            if visits.modify_visit_date(conn, visit_id, visit_date):
                updates_made = True
                _remove_from_queue(conn, visit_id, must_exist=False)

                if existing['status'] in ('checked_in', 'present'):
                    visits.increase_queue_positions(conn, visit_id, existing['doctor_id'])

                try:
                    notif_service.create_notification(
                        conn, visit_id,
                        f'Doctor changed visit {visit_id} date from '
                        f'{existing["visit_date"]} to {visit_date}.'
                    )
                except Exception:
                    pass

        # 2. Status change (queue bookkeeping)
        if status is not None and status != existing['status']:
            if visits.modify_visit_status(conn, visit_id, status):
                updates_made = True

                if status in ('checked_in', 'present'):
                    if not existing.get('checked_in_at'):
                        visits.modify_visit_checked_in_at(conn, visit_id, datetime.now())
                    visits.modify_visit_completed_at(conn, visit_id, None)
                elif status in ('completed', 'done'):
                    visits.modify_visit_completed_at(conn, visit_id, datetime.now())
                    curr_fin_status = financial_status if financial_status is not None else existing.get('financial_status')
                    if curr_fin_status and str(curr_fin_status).lower() == 'unpaid':
                        try:
                            notif_service.create_notification(conn, visit_id, 'unpaid')
                        except Exception:
                            pass

                if status == 'cancelled':
                    _remove_from_queue(conn, visit_id, must_exist=False)
                    try:
                        notif_service.create_notification(
                            conn, visit_id,
                            f'Status of Visit {visit_id} has been changed to {status}.'
                        )
                    except Exception:
                        pass
                elif status in ('checked_in', 'present'):
                    if not visits.get_queue_info(conn, visit_id):
                        visits.increase_queue_positions(conn, visit_id, existing['doctor_id'])
                elif status in ('completed', 'done', 'missed', 'absent'):
                    _remove_from_queue(conn, visit_id, must_exist=False)

        # 3. Doctor change (move the queue entry to the new doctor)
        if doctor_id is not None and doctor_id != existing['doctor_id']:
            if visits.modify_visit_doctor(conn, visit_id, doctor_id):
                updates_made = True
                if visits.get_queue_info(conn, visit_id):
                    _remove_from_queue(conn, visit_id, must_exist=False)
                    visits.increase_queue_positions(conn, visit_id, doctor_id)

        # 4. Visit type change
        if visit_type is not None and visit_type != existing['visit_type']:
            if visits.modify_visit_type(conn, visit_id, visit_type):
                updates_made = True

        # 5. Financial status (billing)
        if financial_status is not None and financial_status != existing.get('financial_status'):
            if visits.modify_visit_financial_status(conn, visit_id, financial_status):
                updates_made = True

        # 6. Free-text details
        if reason is not None and reason != existing.get('reason'):
            if visits.modify_visit_reason(conn, visit_id, reason):
                updates_made = True

        if slot is not None and slot != existing.get('slot'):
            if visits.modify_visit_slot(conn, visit_id, slot):
                updates_made = True

        if not updates_made:
            return visits.get_visit_details(conn, visit_id)

        return visits.get_visit_details(conn, visit_id)

    except ValueError:
        conn.rollback()
        return None
    except Exception:
        conn.rollback()
        return None


# ---------- Cancel & Status ----------

def change_visit_status(conn, visit_id, status, **kwargs):
    """Change the status of a visit and trigger associated business logic."""
    return modify_visit_info(conn, visit_id, status=status, **kwargs)


def cancel_visit(conn, visit_id):
    return modify_visit_info(conn, visit_id, status='cancelled')


# ---------- Read single visit ----------

def get_visit(conn, visit_id):
    """Fetch one visit with the patient and doctor names joined in."""
    return visits.get_visit_details(conn, visit_id)


# ---------- Queue ----------

def get_visit_queue_number(conn, visit_id):
    queue_info = visits.get_queue_info(conn, visit_id)
    if not queue_info:
        return None
    return {
        'visit_id': visit_id,
        'position': queue_info['position'],
        'queue_day': queue_info.get('queue_day'),
    }


# ---------- Search ----------

def search_visits_by_patient(conn, patient_id):
    records = patients.get_patient_visits(conn, patient_id)
    return records if records else None


def search_visits_by_status(conn, status, visit_day=None):
    records = visits.get_visits_by_status(conn, status, visit_day)
    return records or []


def search_visits_by_date(conn, visit_day):
    return visits.get_visits_for_day(conn, visit_day)


def search_visits_by_type(conn, visit_type):
    records = visits.get_visits_by_type(conn, visit_type)
    return records or []


def get_consultation(conn, visit_id):
    """Everything the consultation panel needs, in one request (3 queries)."""
    visit = visits.get_visit_details_with_notes(conn, visit_id)
    if visit is None:
        return None

    notes = visit.pop('notes_json', None)
    if isinstance(notes, str):
        notes = json.loads(notes)
    notes = notes or []

    previous = visit.pop('previous_json', None)
    if isinstance(previous, str):
        previous = json.loads(previous)

    patient = {
        'patient_id': visit['patient_id'],
        'full_name': visit.get('patient_name'),
        'birth_date': visit.get('patient_birth_date'),
        'phone': visit.get('patient_phone'),
        'gender': visit.get('patient_gender'),
        'email': visit.get('patient_email'),
        'blood_type': visit.get('patient_blood_type'),
        'allergies': visit.get('patient_allergies'),
        'conditions': visit.get('patient_conditions'),
        'additional_info': visit.get('patient_additional_info'),
        'emergency_contact': visit.get('patient_emergency_contact'),
        'created_at': visit.get('patient_created_at'),
    }

    previous_encounter = None
    if previous:
        previous = dict(previous)
        content = previous.pop('content', None)
        previous_encounter = {
            'visit': previous,
            'content': content or 'No clinical notes recorded for this visit.',
        }

    return {
        'visit': visit,
        'patient': patient,
        'notes': notes,
        'previous_encounter': previous_encounter,
    }



def get_visit_details_for_doctor(conn, visit_id, doctor_id):
    visit = visits.get_visit_by_id(conn, visit_id)
    if not visit or visit['doctor_id'] != doctor_id:
        return None

    notes = medicalnotes.get_medical_notes_by_visit_id(conn, visit_id)
    visit['medical_notes'] = notes if notes else []

    return visit
