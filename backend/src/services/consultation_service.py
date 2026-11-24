"""Medical notes, including consultation drafts (MEDICALNOTE.is_draft)."""

from src.repository import medicalnotes as repo
from src.repository import visits as visits_repo

UNSET = object()


def _clean_str(value):
    if value is None:
        return None
    text = ' '.join(str(value).split())
    return text if text else None


def get_visit_notes(conn, visit_id):
    visit = visits_repo.get_visit_by_id(conn, visit_id)
    if visit is None:
        return None
    return repo.get_medical_notes_by_visit_id(conn, visit_id) or []


def add_medical_note(conn, visit_id, content, is_draft=False):
    visit = visits_repo.get_visit_by_id(conn, visit_id)
    if visit is None:
        raise LookupError(f"Visit {visit_id} not found")

    cleaned_content = _clean_str(content)
    if not cleaned_content:
        raise ValueError("Note content cannot be empty")

    note_id = repo.create_medical_note(conn, visit_id, cleaned_content, is_draft=is_draft)
    if note_id is None:
        raise RuntimeError("Failed to create medical note")

    return repo.get_medical_note_by_id(conn, note_id) or {
        "note_id": note_id,
        "visit_id": visit_id,
        "content": cleaned_content,
        "is_draft": bool(is_draft),
    }


def update_medical_note(conn, note_id, content, is_draft=UNSET):
    existing = repo.get_medical_note_by_id(conn, note_id)
    if existing is None:
        return None

    cleaned_content = _clean_str(content)
    if not cleaned_content:
        raise ValueError("Note content cannot be empty")

    draft_value = None if is_draft is UNSET else bool(is_draft)
    if not repo.modify_medical_note(conn, note_id, cleaned_content, draft_value):
        raise RuntimeError("Failed to update medical note")

    return repo.get_medical_note_by_id(conn, note_id)
