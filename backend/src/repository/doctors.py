DOCTOR_SELECT = (
    'select d.doctor_id, d.employee_id, e.full_name, d.specialty, '
    'd.slot_length_minutes, d.npi, d.license_no, '
    'e.email, e.phone, o.room_no, '
    'a.start_day, a.end_day, a.status as availability_status, '
    '(select count(*) from QUEUE q '
    ' where q.doctor_id = d.doctor_id and q.queue_day = curdate()) as queue_count '
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


def get_all_doctors(conn):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            DOCTOR_SELECT +
            'order by e.full_name'
        )
        return cur.fetchall()


def get_doctor_week_visits(conn, doctor_id, start_day, end_day):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select visit_id, visit_date, status '
            'from VISIT '
            'where doctor_id = %s '
            'and visit_date >= %s and visit_date < %s + interval 1 day '
            'order by visit_date',
            (doctor_id, start_day, end_day)
        )
        return cur.fetchall()


def get_doctor_availability(conn, doctor_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select d.doctor_id, d.employee_id, e.full_name, d.specialty, '
            'd.slot_length_minutes, d.npi, d.license_no, e.email, e.phone, '
            'o.room_no, a.start_day, a.end_day, a.status as availability_status, '
            '(select count(*) from QUEUE q '
            ' where q.doctor_id = d.doctor_id and q.queue_day = curdate()) as queue_count '
            'from DOCTOR d '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'left join OFFICE o on o.office_id = e.office_id '
            'left join EMPLOYEEAVAILABILITY a on a.employee_id = e.employee_id '
            'where d.doctor_id = %s', (doctor_id,)
        )
        return cur.fetchone()


def update_doctor_availability(conn, doctor_id, status):
    try:
        with conn.cursor() as cur:
            cur.execute('select employee_id from DOCTOR where doctor_id = %s', (doctor_id,))
            doc = cur.fetchone()
            if not doc:
                return False
            emp_id = doc[0]

            cur.execute(
                'insert into EMPLOYEEAVAILABILITY (employee_id, start_day, end_day, status) '
                "values (%s, 'monday', 'friday', %s) "
                'on duplicate key update status = %s',
                (emp_id, status, status)
            )
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def get_doctor_queue(conn, doctor_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select c.total_today, c.completed_today, '
            'q.position, q.queue_day, '
            'v.visit_id, v.visit_type, v.visit_date, v.status, v.financial_status, '
            'v.reason, v.slot, v.checked_in_at, v.completed_at, '
            'p.patient_id, p.full_name as patient_name, p.phone as patient_phone, '
            'p.birth_date as patient_birth_date, '
            'd.doctor_id, e.full_name as doctor_name, d.specialty, o.room_no as room '
            'from (select count(*) as total_today, '
            "             coalesce(sum(case when status = 'completed' then 1 else 0 end), 0) "
            '                    as completed_today '
            '      from VISIT '
            '      where doctor_id = %s '
            '        and visit_date >= curdate() '
            '        and visit_date < curdate() + interval 1 day) c '
            'left join QUEUE q on q.doctor_id = %s and q.queue_day = curdate() '
            'left join VISIT v on v.visit_id = q.visit_id '
            'left join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = %s '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'left join OFFICE o on o.office_id = e.office_id '
            'order by q.position',
            (doctor_id, doctor_id, doctor_id)
        )
        return cur.fetchall()


def get_doctor_visits(conn, doctor_id, visit_day=None):
    query = (
        'select v.visit_id, v.visit_type, v.visit_date, v.status, v.financial_status, '
        'v.reason, v.slot, v.checked_in_at, v.completed_at, '
        'p.patient_id, p.full_name as patient_name, p.phone as patient_phone, '
        'd.doctor_id, e.full_name as doctor_name, d.specialty, o.room_no as room '
        'from VISIT v '
        'join PATIENT p on p.patient_id = v.patient_id '
        'join DOCTOR d on d.doctor_id = v.doctor_id '
        'join EMPLOYEE e on e.employee_id = d.employee_id '
        'left join OFFICE o on o.office_id = e.office_id '
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
