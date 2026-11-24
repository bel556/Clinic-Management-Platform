
PHONE_DIGITS = (
    "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone,' ',''),'-',''),"
    "'(',''),')',''),'.',''),'+','')"
)


def create_patient(conn, full_name, birth_date, phone, gender,
                   email: str | None = None,
                   additional_info: str | None = None,
                   emergency_contact: str | None = None,
                   blood_type: str | None = None,
                   allergies: str | None = None,
                   conditions: str | None = None):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'insert into PATIENT(full_name,birth_date,phone,gender,email,additional_info,'
                'emergency_contact,blood_type,allergies,conditions) '
                'values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                (full_name, birth_date, phone, gender, email, additional_info,
                 emergency_contact, blood_type, allergies, conditions)
            )
            conn.commit()
            return cur.lastrowid

    except Exception:
        conn.rollback()
        return None


def update_patient(conn, patient_id, full_name, birth_date, phone, gender,
                   email, additional_info, emergency_contact,
                   blood_type=None, allergies=None, conditions=None):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update PATIENT '
                'set full_name = %s, birth_date = %s, phone = %s, gender = %s, '
                '    email = %s, additional_info = %s, emergency_contact = %s, '
                '    blood_type = %s, allergies = %s, conditions = %s '
                'where patient_id = %s',
                (full_name, birth_date, phone, gender, email,
                 additional_info, emergency_contact, blood_type,
                 allergies, conditions, patient_id)
            )
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


def get_patients_by_phone(conn, digits, limit: int = 50):
    """`digits` must already be punctuation-free (see patient_service)."""
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select * from PATIENT '
            f'where {PHONE_DIGITS} like %s '
            'order by full_name '
            'limit %s', (f'{digits}%', limit)
        )
        return cur.fetchall()


def get_all_patients(conn, limit: int = 50, offset: int = 0, order: str = 'name'):
    ordering = 'created_at desc' if order == 'recent' else 'full_name'
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            f'select * from PATIENT '
            f'order by {ordering} '
            'limit %s offset %s', (limit, offset)
        )
        return cur.fetchall()


def get_patient_visits(conn, patient_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select v.visit_id, v.visit_date, v.financial_status, v.status, '
            'v.visit_type, v.reason, v.slot, v.checked_in_at, v.completed_at, '
            'd.doctor_id, e.full_name as doctor_name, d.specialty, q.position '
            'from VISIT v '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
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
