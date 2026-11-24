from src.repository import medicalnotes as repo
from src.repository import visits as visits_repo

def _clean_str(value):
    if value is None:
        return None
    text = ' '.join(value.split())
    return text if text else None

def get_visit_notes(conn, visit_id):
    visit = visits_repo.get_visit_by_id(conn, visit_id)
    if visit is None:
        return None
    return repo.get_medical_notes_by_visit_id(conn, visit_id) or []

def add_medical_note(conn, visit_id, content):
    visit = visits_repo.get_visit_by_id(conn, visit_id)
    if visit is None:
        raise ValueError(f"Visit {visit_id} not found")

    cleaned_content = _clean_str(content)
    if not cleaned_content:
        raise ValueError("Note content cannot be empty")

    note_id = repo.create_medical_note(conn, visit_id, cleaned_content)
    if note_id is None:
        raise RuntimeError("Failed to create medical note")

    return repo.get_medical_note_by_id(conn, note_id) or {
        "note_id": note_id,
        "visit_id": visit_id,
        "content": cleaned_content,
    }

def update_medical_note(conn, note_id, content):
    existing = repo.get_medical_note_by_id(conn, note_id)
    if existing is None:
        return None

    cleaned_content = _clean_str(content)
    if not cleaned_content:
        raise ValueError("Note content cannot be empty")

    if not repo.modify_medical_note(conn, note_id, cleaned_content):
        raise RuntimeError("Failed to update medical note")

    return repo.get_medical_note_by_id(conn, note_id)
