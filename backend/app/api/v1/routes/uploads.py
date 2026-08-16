import uuid
from datetime import datetime
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.api.deps import CurrentUser
from app.core.config import settings
from app.core.exceptions import ForbiddenError
from app.core.rate_limit import AppRateLimiter
from app.services.uploads import (
    UPLOAD_CHUNK_SIZE,
    FileTooLargeError,
    UploadNotFoundError,
    UploadRecord,
    UploadService,
)

router = APIRouter(prefix="/uploads", tags=["uploads"])


class UploadRead(BaseModel):
    id: str
    original_name: str
    content_type: str
    size: int
    url: str
    uploaded_at: datetime


def _to_read(record: UploadRecord) -> UploadRead:
    return UploadRead(
        id=record.id,
        original_name=record.original_name,
        content_type=record.content_type,
        size=record.size,
        url=f"/api/v1/uploads/{record.id}",
        uploaded_at=record.uploaded_at,
    )


@router.post(
    "",
    response_model=UploadRead,
    status_code=201,
    dependencies=[Depends(AppRateLimiter("public"))],
)
def upload_file(
    file: Annotated[UploadFile, File(description="File to upload")],
    current_user: CurrentUser,
) -> UploadRead:
    """Accept a file, validate size and magic bytes, store under a random name."""
    service = UploadService()
    temp_path = Path(settings.UPLOAD_DIR) / f".tmp-{uuid.uuid4().hex}"
    size = 0
    try:
        with temp_path.open("wb") as out:
            while chunk := file.file.read(UPLOAD_CHUNK_SIZE):
                size += len(chunk)
                if size > UploadService.max_upload_bytes():
                    raise FileTooLargeError(f"file exceeds the {settings.MAX_UPLOAD_SIZE_MB} MB upload limit")
                out.write(chunk)
        record = service.finalize(
            owner_id=current_user.id,
            original_name=file.filename or "upload",
            source=temp_path,
            size=size,
        )
    finally:
        temp_path.unlink(missing_ok=True)
    return _to_read(record)


@router.get("/{upload_id}")
def download_upload(upload_id: str, current_user: CurrentUser) -> FileResponse:
    """Stream a stored file back to its owner (or a superuser)."""
    service = UploadService()
    record = service.get(upload_id)
    if record is None:
        raise UploadNotFoundError()
    if not service.is_owner(record, current_user.id) and not current_user.is_superuser:
        raise ForbiddenError()
    path = service.resolve(record)
    if not path.is_file():
        raise UploadNotFoundError()
    return FileResponse(
        path=path,
        media_type=record.content_type,
        headers={"X-Content-Type-Options": "nosniff"},
        filename=record.original_name,
    )
