"""Visit and queue persistence.

Queue positions are scoped to (doctor, day) so each morning starts at Q-01, and
removing an entry renumbers the remaining positions of that day.
"""


def create_visit(conn, patient_id, doctor_id, visit_date, visit_type,
                 status: str = 'scheduled', financial_status: str = 'unpaid',
                 reason=None, slot=None, checked_in_at=None, completed_at=None):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'insert into VISIT(patient_id,doctor_id,visit_date,financial_status,'
                'status,visit_type,reason,slot,checked_in_at,completed_at) '
                'values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                (patient_id, doctor_id, visit_date, financial_status,
                 status, visit_type, reason, slot, checked_in_at, completed_at)
            )
            conn.commit()
            return cur.lastrowid

    except Exception:
        conn.rollback()
        return None


def get_visit_by_id(conn, visit_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select * from VISIT '
            'where visit_id = %s', (visit_id,)
        )
        return cur.fetchone()


def get_visit_details(conn, visit_id):
    """Single visit with patient/doctor display names for the client."""
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select v.*, p.full_name as patient_name, p.phone as patient_phone, '
            'p.birth_date as patient_birth_date, p.gender as patient_gender, '
            'p.email as patient_email, p.blood_type as patient_blood_type, '
            'p.allergies as patient_allergies, p.conditions as patient_conditions, '
            'p.additional_info as patient_additional_info, '
            'p.emergency_contact as patient_emergency_contact, '
            'p.created_at as patient_created_at, '
            'e.full_name as doctor_name, d.specialty, o.room_no as room, q.position '
            'from VISIT v '
            'join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'left join OFFICE o on o.office_id = e.office_id '
            'left join QUEUE q on q.visit_id = v.visit_id '
            'where v.visit_id = %s', (visit_id,)
        )
        return cur.fetchone()


def get_visit_details_with_notes(conn, visit_id):
    """Visit + patient + queue + notes aggregated as JSON (one query)."""
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select v.*, p.full_name as patient_name, p.phone as patient_phone, '
            'p.birth_date as patient_birth_date, p.gender as patient_gender, '
            'p.email as patient_email, p.blood_type as patient_blood_type, '
            'p.allergies as patient_allergies, p.conditions as patient_conditions, '
            'p.additional_info as patient_additional_info, '
            'p.emergency_contact as patient_emergency_contact, '
            'p.created_at as patient_created_at, '
            'e.full_name as doctor_name, d.specialty, o.room_no as room, q.position, '
            '(select JSON_ARRAYAGG(JSON_OBJECT('
            "  'note_id', mn.note_id, 'visit_id', mn.visit_id, "
            "  'content', mn.content, 'is_draft', mn.is_draft, "
            "  'created_at', mn.created_at)) "
            ' from MEDICALNOTE mn where mn.visit_id = v.visit_id) as notes_json, '
            '(select JSON_OBJECT('
            "  'visit_id', pv.visit_id, 'patient_id', pv.patient_id, "
            "  'doctor_id', pv.doctor_id, 'visit_date', pv.visit_date, "
            "  'visit_type', pv.visit_type, 'status', pv.status, "
            "  'financial_status', pv.financial_status, 'reason', pv.reason, "
            "  'slot', pv.slot, 'checked_in_at', pv.checked_in_at, "
            "  'completed_at', pv.completed_at, "
            "  'doctor_name', pe.full_name, 'specialty', pd.specialty, "
            "  'content', pmn.content) "
            ' from VISIT pv '
            ' join DOCTOR pd on pd.doctor_id = pv.doctor_id '
            ' join EMPLOYEE pe on pe.employee_id = pd.employee_id '
            ' left join MEDICALNOTE pmn on pmn.visit_id = pv.visit_id and pmn.is_draft = 0 '
            ' where pv.patient_id = v.patient_id and pv.visit_id <> v.visit_id '
            "   and pv.status in ('completed', 'done') "
            ' order by pv.visit_date desc, pmn.created_at desc limit 1) as previous_json '
            'from VISIT v '
            'join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'left join OFFICE o on o.office_id = e.office_id '
            'left join QUEUE q on q.visit_id = v.visit_id '
            'where v.visit_id = %s', (visit_id,)
        )
        return cur.fetchone()


def get_visits_by_status(conn, status, visit_day=None):
    query = (
        'select v.*, p.full_name as patient_name, p.phone as patient_phone, '
        'e.full_name as doctor_name, d.specialty, o.room_no as room, q.position '
        'from VISIT v '
        'join PATIENT p on p.patient_id = v.patient_id '
        'join DOCTOR d on d.doctor_id = v.doctor_id '
        'join EMPLOYEE e on e.employee_id = d.employee_id '
        'left join OFFICE o on o.office_id = e.office_id '
        'left join QUEUE q on q.visit_id = v.visit_id '
        'where v.status = %s '
    )
    params = [status]

    if visit_day is not None:
        query += 'and v.visit_date >= %s and v.visit_date < %s + interval 1 day '
        params += [visit_day, visit_day]

    query += 'order by v.visit_date'

    with conn.cursor(dictionary=True) as cur:
        cur.execute(query, tuple(params))
        return cur.fetchall()


def get_visits_for_day(conn, visit_day):
    """One query for a whole day instead of one query per status."""
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select v.*, p.full_name as patient_name, p.phone as patient_phone, '
            'e.full_name as doctor_name, d.specialty, o.room_no as room, q.position '
            'from VISIT v '
            'join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'left join OFFICE o on o.office_id = e.office_id '
            'left join QUEUE q on q.visit_id = v.visit_id '
            'where v.visit_date >= %s and v.visit_date < %s + interval 1 day '
            'order by v.visit_date',
            (visit_day, visit_day)
        )
        return cur.fetchall()


def get_visits_by_type(conn, visit_type):
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


# ---- single-field writers -------------------------------------------------

def _update_field(conn, column, visit_id, value):
    try:
        with conn.cursor() as cur:
            cur.execute(
                f'update VISIT set {column} = %s where visit_id = %s',
                (value, visit_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def modify_visit_date(conn, visit_id, new_visit_date):
    return _update_field(conn, 'visit_date', visit_id, new_visit_date)


def modify_visit_doctor(conn, visit_id, new_doctor_id):
    return _update_field(conn, 'doctor_id', visit_id, new_doctor_id)


def modify_visit_type(conn, visit_id, new_visit_type):
    return _update_field(conn, 'visit_type', visit_id, new_visit_type)


def modify_visit_status(conn, visit_id, new_status):
    return _update_field(conn, 'status', visit_id, new_status)


def modify_visit_financial_status(conn, visit_id, financial_status):
    return _update_field(conn, 'financial_status', visit_id, financial_status)


def modify_visit_reason(conn, visit_id, new_reason):
    return _update_field(conn, 'reason', visit_id, new_reason)


def modify_visit_slot(conn, visit_id, new_slot):
    return _update_field(conn, 'slot', visit_id, new_slot)


def modify_visit_checked_in_at(conn, visit_id, value):
    return _update_field(conn, 'checked_in_at', visit_id, value)


def modify_visit_completed_at(conn, visit_id, value):
    return _update_field(conn, 'completed_at', visit_id, value)


# ---- queue ----------------------------------------------------------------

def _queue_day_for_visit(conn, visit_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select date(visit_date) as queue_day from VISIT where visit_id = %s',
            (visit_id,)
        )
        row = cur.fetchone()
        return row['queue_day'] if row else None


def get_queue_info(conn, visit_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'SELECT doctor_id, position, queue_day FROM QUEUE WHERE visit_id = %s',
            (visit_id,)
        )
        return cur.fetchone()


def increase_queue_positions(conn, visit_id, doctor_id, queue_day=None):
    """Append the visit to the doctor's queue for the visit's own day."""
    if queue_day is None:
        queue_day = _queue_day_for_visit(conn, visit_id)
        if queue_day is None:
            return None

    try:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                'SELECT COALESCE(MAX(position), 0) AS max_pos '
                'FROM QUEUE WHERE doctor_id = %s AND queue_day = %s',
                (doctor_id, queue_day)
            )
            next_position = int(cur.fetchone()['max_pos']) + 1

            cur.execute(
                'INSERT INTO QUEUE (doctor_id, visit_id, position, queue_day) '
                'VALUES (%s, %s, %s, %s)',
                (doctor_id, visit_id, next_position, queue_day)
            )
            conn.commit()
            return {'visit_id': visit_id, 'position': next_position, 'queue_day': queue_day}

    except Exception:
        conn.rollback()
        return None


def delete_from_queue(conn, visit_id):
    """Remove a visit and close the gap left in its doctor's day queue."""
    try:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                'SELECT doctor_id, position, queue_day FROM QUEUE WHERE visit_id = %s',
                (visit_id,)
            )
            info = cur.fetchone()

            cur.execute('DELETE FROM QUEUE WHERE visit_id = %s', (visit_id,))
            if info:
                cur.execute(
                    'UPDATE QUEUE SET position = position - 1 '
                    'WHERE doctor_id = %s AND queue_day = %s AND position > %s '
                    'ORDER BY position ASC',
                    (info['doctor_id'], info['queue_day'], info['position'])
                )
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def get_visits_with_doctor_cancelled(conn, patient_id, doctor_id, visit_date, visit_type):
    """Returns None when an identical live visit already exists."""
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
            return True
    except Exception:
        return None
