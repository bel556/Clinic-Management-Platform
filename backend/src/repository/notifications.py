def create_notification(conn, visit_id, message):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'insert into NOTIFICATION(visit_id,message) '
                'values(%s,%s)', (visit_id, message)
            )
            conn.commit()
            return cur.lastrowid

    except Exception:
        conn.rollback()
        return None


def delete_notification(conn, notification_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'delete from NOTIFICATION '
                'where notification_id = %s', (notification_id,)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def mark_notification_read(conn, notification_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update NOTIFICATION '
                'set is_read = true '
                'where notification_id = %s', (notification_id,)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def get_all_notifications(conn):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select n.notification_id, n.message, n.is_read, '
            'v.visit_id, v.visit_date, v.visit_type, v.status, '
            'p.patient_id, p.full_name as patient_name, p.phone as patient_phone, '
            'd.doctor_id, e.full_name as doctor_name '
            'from NOTIFICATION n '
            'join VISIT v on v.visit_id = n.visit_id '
            'join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'order by n.notification_id desc'
        )
        return cur.fetchall()


def get_unread_notifications(conn):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select n.notification_id, n.message, n.is_read, '
            'v.visit_id, v.visit_date, v.visit_type, v.status, '
            'p.patient_id, p.full_name as patient_name, p.phone as patient_phone, '
            'd.doctor_id, e.full_name as doctor_name '
            'from NOTIFICATION n '
            'join VISIT v on v.visit_id = n.visit_id '
            'join PATIENT p on p.patient_id = v.patient_id '
            'join DOCTOR d on d.doctor_id = v.doctor_id '
            'join EMPLOYEE e on e.employee_id = d.employee_id '
            'where n.is_read = false '
            'order by n.notification_id desc'
        )
        return cur.fetchall()