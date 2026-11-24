def create_visit(conn, patient_id, doctor_id, visit_date, visit_type, status: str = 'scheduled'):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'insert into VISIT(patient_id,doctor_id,visit_date,financial_status,status,visit_type) '
                "values(%s,%s,%s,'unpaid',%s,%s)",
                (patient_id, doctor_id, visit_date, status, visit_type)
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


def get_visits_by_status(conn, status, visit_day=None):
    query = (
        'select v.*, p.full_name as patient_name, e.full_name as doctor_name '
        'from VISIT v '
        'join PATIENT p on p.patient_id = v.patient_id '
        'join DOCTOR d on d.doctor_id = v.doctor_id '
        'join EMPLOYEE e on e.employee_id = d.employee_id '
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


def get_visits_by_financial_status(conn, financial_status, visit_day=None):
    query = (
        'select v.*, p.full_name as patient_name, e.full_name as doctor_name '
        'from VISIT v '
        'join PATIENT p on p.patient_id = v.patient_id '
        'join DOCTOR d on d.doctor_id = v.doctor_id '
        'join EMPLOYEE e on e.employee_id = d.employee_id '
        'where v.financial_status = %s '
    )
    params = [financial_status]

    if visit_day is not None:
        query += 'and v.visit_date >= %s and v.visit_date < %s + interval 1 day '
        params += [visit_day, visit_day]

    query += 'order by v.visit_date'

    with conn.cursor(dictionary=True) as cur:
        cur.execute(query, tuple(params))
        return cur.fetchall()


def modify_visit_date(conn, visit_id, new_visit_date):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update VISIT '
                'set visit_date = %s '
                'where visit_id = %s', (new_visit_date, visit_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def modify_visit_doctor(conn, visit_id, new_doctor_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update VISIT '
                'set doctor_id = %s '
                'where visit_id = %s', (new_doctor_id, visit_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def modify_visit_type(conn, visit_id, new_visit_type):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update VISIT '
                'set visit_type = %s '
                'where visit_id = %s', (new_visit_type, visit_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def modify_visit_status(conn, visit_id, new_status):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update VISIT '
                'set status = %s '
                'where visit_id = %s', (new_status, visit_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def delete_visit(conn, visit_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'delete from VISIT '
                'where visit_id = %s', (visit_id,)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False

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

def decrease_queue_positions(conn, doctor_id, removed_position=None):
    """
    Decreases the queue position by 1 for all visits belonging to a specific doctor.
    
    :param removed_position: If provided, only decreases positions that 
                             are strictly greater than this number (e.g., if patient 
                             at position 3 is removed, positions 4, 5, etc. move up).
                             If not provided, it decreases the entire queue by 1.
    """
    try:
        with conn.cursor() as cur:
            if removed_position is not None:
                cur.execute(
                    'UPDATE QUEUE '
                    'SET position = position - 1 '
                    'WHERE doctor_id = %s AND position > %s',
                    (doctor_id, removed_position)
                )
            else:
                cur.execute(
                    'UPDATE QUEUE '
                    'SET position = position - 1 '
                    'WHERE doctor_id = %s',
                    (doctor_id,)
                )
            
            conn.commit()
            return {
                'doctor_id': doctor_id,
                'updated_rows': cur.rowcount,
                'removed_position_threshold': removed_position
            }
            
    except Exception:
        conn.rollback()
        return None

def increase_queue_positions(conn, visit_id, doctor_id):
    """
    Adds a visit to the end of the doctor's queue.
    Returns a dict with the new position, or None on failure.
    """
    try:
        with conn.cursor(dictionary=True) as cur:
            # 1. Find the current highest position for this doctor
            cur.execute(
                'SELECT MAX(position) as max_pos FROM QUEUE WHERE doctor_id = %s', 
                (doctor_id,)
            )
            row = cur.fetchone()
            
            # If queue is empty (max_pos is None), start at 1. Otherwise, add 1.
            next_position = (row['max_pos'] or 0) + 1
            
            # 2. Insert the new visit into the queue
            cur.execute(
                'INSERT INTO QUEUE (doctor_id, visit_id, position) VALUES (%s, %s, %s)',
                (doctor_id, visit_id, next_position)
            )
            conn.commit()
            
            return {'visit_id': visit_id, 'position': next_position}
            
    except Exception:
        conn.rollback()
        return None


def get_queue_info(conn, visit_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute('SELECT doctor_id, position FROM QUEUE WHERE visit_id = %s', (visit_id,))
        return cur.fetchone()
        
def delete_from_queue(conn, visit_id):
    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM QUEUE WHERE visit_id = %s', (visit_id,))
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def get_visits_with_doctor_cancelled(conn,patient_id,doctor_id,visit_date,visit_type):
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