

EMPLOYEE_SELECT = (
    'select e.employee_id, e.full_name, e.role as employee_role, e.email, e.phone, '
    'o.room_no, a.start_day, a.end_day, a.status as availability_status '
    'from EMPLOYEE e '
    'left join OFFICE o on o.office_id = e.office_id '
    'left join EMPLOYEEAVAILABILITY a on a.employee_id = e.employee_id '
)


def get_all_employees(conn, role=None):
    query = EMPLOYEE_SELECT
    params = []
    if role:
        query += 'where e.employee_role = %s '
        params.append(role)
    query += 'order by e.full_name'
    with conn.cursor(dictionary=True) as cur:
        cur.execute(query, tuple(params))
        return cur.fetchall()


def get_employee_by_id(conn, employee_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(EMPLOYEE_SELECT + 'where e.employee_id = %s', (employee_id,))
        return cur.fetchone()


def update_employee_availability(conn, employee_id, status):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'insert into EMPLOYEEAVAILABILITY (employee_id, start_day, end_day, status) '
                "values (%s, 'monday', 'friday', %s) "
                'on duplicate key update status = %s',
                (employee_id, status, status)
            )
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False
