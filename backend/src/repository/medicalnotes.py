def create_medical_note(conn, visit_id, content, is_draft=False):
    try:
        with conn.cursor() as cur:
            cur.execute(
                'insert into MEDICALNOTE(visit_id,content,is_draft) '
                'values(%s,%s,%s)', (visit_id, content, 1 if is_draft else 0)
            )
            conn.commit()
            return cur.lastrowid

    except Exception:
        conn.rollback()
        return None


def modify_medical_note(conn, note_id, new_content, is_draft=None):
    try:
        with conn.cursor() as cur:
            if is_draft is None:
                cur.execute(
                    'update MEDICALNOTE '
                    'set content = %s '
                    'where note_id = %s', (new_content, note_id)
                )
            else:
                cur.execute(
                    'update MEDICALNOTE '
                    'set content = %s, is_draft = %s '
                    'where note_id = %s',
                    (new_content, 1 if is_draft else 0, note_id)
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
            'order by is_draft desc, created_at desc', (visit_id,)
        )
        return cur.fetchall()


def get_medical_note_by_id(conn, note_id):
    with conn.cursor(dictionary=True) as cur:
        cur.execute(
            'select * from MEDICALNOTE '
            'where note_id = %s', (note_id,)
        )
        return cur.fetchone()
