def create_patient(conn, full_name, birth_date, phone, gender,
                   email: str | None = None,
                   additional_info: str | None = None,
                   emergency_contact: str | None = None):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'insert into PATIENT(full_name,birth_date,phone,gender,email,additional_info,emergency_contact) '
                'values(%s,%s,%s,%s,%s,%s,%s)',
                (full_name, birth_date, phone, gender, email, additional_info, emergency_contact)
            )
            conn.commit()
            return cur.lastrowid

    except Exception:
        conn.rollback()
        return None


def modify_patient_name(conn, patient_id, new_name):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update PATIENT '
                'set full_name = %s '
                'where patient_id = %s', (new_name, patient_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def modify_patient_birth_date(conn, patient_id, new_birth_date):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update PATIENT '
                'set birth_date = %s '
                'where patient_id = %s', (new_birth_date, patient_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def modify_patient_phone(conn, patient_id, new_phone):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update PATIENT '
                'set phone = %s '
                'where patient_id = %s', (new_phone, patient_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def modify_patient_additional_info(conn, patient_id, new_additional_info):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update PATIENT '
                'set additional_info = %s '
                'where patient_id = %s', (new_additional_info, patient_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def modify_patient_email(conn, patient_id, new_email):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update PATIENT '
                'set email = %s '
                'where patient_id = %s', (new_email, patient_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def get_patient_by_id(conn, patient_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select * from PATIENT '
            'where patient_id = %s', (patient_id,)
        )
        return cur.fetchone()


def get_patients_by_name(conn, name, limit: int = 50):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select * from PATIENT '
            'where full_name like %s '
            'order by full_name '
            'limit %s', (f'%{name}%', limit)
        )
        return cur.fetchall()


def get_patients_by_phone(conn, phone, limit: int = 50):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select * from PATIENT '
            'where phone like %s '
            'order by full_name '
            'limit %s', (f'{phone}%', limit)
        )
        return cur.fetchall()


def get_all_patients(conn, limit: int = 50, offset: int = 0):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select * from PATIENT '
            'order by full_name '
            'limit %s offset %s', (limit, offset)
        )
        return cur.fetchall()


def get_patient_visits(conn, patient_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select v.visit_id, v.visit_date, v.financial_status, v.status, '
            'd.doctor_id, e.full_name as doctor_name, d.specialty, q.position '
            'from VISIT v '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id ' \
            'left join QUEUE q on q.visit_id = v.visit_id '
            'where v.patient_id = %s '
            'order by v.visit_date desc', (patient_id,)
        )
        return cur.fetchall()


def delete_patient(conn, patient_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'delete from PATIENT '
                'where patient_id = %s', (patient_id,)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False