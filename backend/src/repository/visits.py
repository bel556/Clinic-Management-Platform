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