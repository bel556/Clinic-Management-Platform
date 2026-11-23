DOCTOR_SELECT = (
    'select d.doctor_id, e.full_name, d.specialty, o.room_no, '
    'a.start_day, a.end_day, a.status as availability_status '
    'from DOCTOR d '
    'join EMPLOYEE e on e.employee_id = d.employee_id '
    'left join OFFICE o on o.office_id = e.office_id '
    'left join EMPLOYEEAVAILABILITY a on a.employee_id = e.employee_id '
)


def get_doctor_by_id(conn, doctor_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            DOCTOR_SELECT +
            'where d.doctor_id = %s', (doctor_id,)
        )
        return cur.fetchone()


def get_doctors_by_specialty(conn, specialty):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            DOCTOR_SELECT +
            'where d.specialty = %s '
            'order by e.full_name', (specialty,)
        )
        return cur.fetchall()


def get_present_doctors_by_specialty(conn, specialty):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            DOCTOR_SELECT +
            "where d.specialty = %s and a.status = 'present' "
            'order by e.full_name', (specialty,)
        )
        return cur.fetchall()


def get_doctors_by_name(conn, name):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            DOCTOR_SELECT +
            'where e.full_name like %s '
            'order by e.full_name', (f'%{name}%',)
        )
        return cur.fetchall()


def get_doctor_queue(conn, doctor_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select q.position, '
            'v.visit_id, v.visit_type, v.visit_date, v.status, v.financial_status, '
            'p.patient_id, p.full_name as patient_name, p.phone as patient_phone, '
            'p.birth_date as patient_birth_date, '
            'd.doctor_id, e.full_name as doctor_name, d.specialty '
            'from QUEUE q '
            'join VISIT v on v.visit_id = q.visit_id '
            'join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = q.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'where q.doctor_id = %s '
            'order by q.position', (doctor_id,)
        )
        return cur.fetchall()


def get_doctor_visits(conn, doctor_id, visit_day=None):
    query = (
        'select v.visit_id, v.visit_type, v.visit_date, v.status, v.financial_status, '
        'p.patient_id, p.full_name as patient_name, p.phone as patient_phone '
        'from VISIT v '
        'join PATIENT p on p.patient_id = v.patient_id '
        'where v.doctor_id = %s '
    )
    params = [doctor_id]

    if visit_day is not None:
        query += 'and v.visit_date >= %s and v.visit_date < %s + interval 1 day '
        params += [visit_day, visit_day]

    query += 'order by v.visit_date desc'

    with conn.cursor(dictionary=True) as cur:
        cur.execute(query, tuple(params))
        return cur.fetchall()