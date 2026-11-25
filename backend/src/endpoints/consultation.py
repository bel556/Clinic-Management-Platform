from fastapi import APIRouter, Depends, HTTPException, status
from src.database.connection import get_connection
from src.schemas import MedicalNoteCreate, MedicalNoteUpdate
from src.services import consultation_service

consultation_router = APIRouter(tags=["Consultation & Medical Notes"])


# return all medical notes for a given visit
@consultation_router.get("/visits/{visit_id}/notes")
def get_notes_for_visit(
    visit_id: int,
    conn=Depends(get_connection),
):
    notes = consultation_service.get_visit_notes(conn, visit_id)
    if notes is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit {visit_id} not found",
        )
    return notes


# create a new medical note for a given visit
@consultation_router.post("/visits/{visit_id}/notes", status_code=status.HTTP_201_CREATED)
def create_note_for_visit(
    visit_id: int,
    payload: MedicalNoteCreate,
    conn=Depends(get_connection),
):
    try:
        new_note = consultation_service.add_medical_note(
            conn, visit_id, payload.content, is_draft=payload.is_draft
        )
        return new_note
    except LookupError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


# update an existing medical note by ID
@consultation_router.patch("/medical-notes/{note_id}")
def update_note(
    note_id: int,
    payload: MedicalNoteUpdate,
    conn=Depends(get_connection),
):
    try:
        updated = consultation_service.update_medical_note(
            conn,
            note_id,
            payload.content,
            is_draft=payload.is_draft
            if payload.is_draft is not None
            else consultation_service.UNSET,
        )
        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medical note {note_id} not found",
            )
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )