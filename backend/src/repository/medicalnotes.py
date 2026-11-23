def create_medical_note(conn, visit_id, content):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'insert into MEDICALNOTE(visit_id,content) '
                'values(%s,%s)', (visit_id, content)
            )
            conn.commit()
            return cur.lastrowid

    except Exception:
        conn.rollback()
        return None


def modify_medical_note(conn, note_id, new_content):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'update MEDICALNOTE '
                'set content = %s '
                'where note_id = %s', (new_content, note_id)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return False
            conn.commit()
            return True
    except Exception:
        conn.rollback()
        return False


def get_medical_notes_by_visit_id(conn, visit_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select * from MEDICALNOTE '
            'where visit_id = %s '
            'order by note_id', (visit_id,)
        )
        return cur.fetchall()