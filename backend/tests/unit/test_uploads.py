from datetime import UTC, datetime
from pathlib import Path

import pytest

from app.core.config import settings
from app.core.exceptions import ForbiddenError
from app.services.uploads import (
    FileTooLargeError,
    FileTypeNotAllowedError,
    QuotaExceededError,
    UploadNotFoundError,
    UploadRecord,
    UploadService,
    extension_of,
)

PNG_HEADER = b"\x89PNG\r\n\x1a\n" + b"\x00" * 128


def _source(tmp_path: Path, name: str, content: bytes) -> Path:
    path = tmp_path / name
    path.write_bytes(content)
    return path


def _service(tmp_path: Path) -> UploadService:
    return UploadService(upload_dir=tmp_path / "uploads")


def test_accept_png(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "shot.png", PNG_HEADER)
    record = service.finalize(owner_id="user-1", original_name="shot.png", source=src, size=len(PNG_HEADER))
    assert record.content_type == "image/png"
    assert record.path.startswith("user-1/")
    stored = service.resolve(record)
    assert stored.is_file()
    assert stored.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"


def test_accept_plain_text(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "notes.md", b"# Hello\nworld\n")
    record = service.finalize(owner_id="user-1", original_name="notes.md", source=src, size=14)
    assert record.content_type == "text/plain"


def test_accept_json(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "data.json", b'{"a": 1}')
    record = service.finalize(owner_id="user-1", original_name="data.json", source=src, size=9)
    assert record.content_type == "application/json"


def test_accept_zip_container_as_docx(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "report.docx", b"PK\x03\x04" + b"\x00" * 64)
    record = service.finalize(owner_id="user-1", original_name="report.docx", source=src, size=68)
    assert record.content_type == "application/zip"
    assert record.id.endswith(".docx")


def test_reject_spoofed_extension(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "evil.png", b"MZ\x90\x00" + b"\x00" * 64)
    with pytest.raises(FileTypeNotAllowedError):
        service.finalize(owner_id="user-1", original_name="evil.png", source=src, size=4)


def test_reject_binary_pretending_to_be_text(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "script.txt", b"MZ\x00\x00\x00\x00binary\x00data")
    with pytest.raises(FileTypeNotAllowedError):
        service.finalize(owner_id="user-1", original_name="script.txt", source=src, size=16)


def test_reject_unknown_extension(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "installer.exe", b"MZ\x90\x00")
    with pytest.raises(FileTypeNotAllowedError):
        service.finalize(owner_id="user-1", original_name="installer.exe", source=src, size=4)


def test_reject_oversized(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_MB", 1)
    service = _service(tmp_path)
    src = _source(tmp_path, "big.png", PNG_HEADER)
    with pytest.raises(FileTooLargeError):
        service.finalize(owner_id="user-1", original_name="big.png", source=src, size=2 * 1024 * 1024)


def test_per_user_quota(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(settings, "UPLOAD_PER_USER_QUOTA_MB", 1)
    service = _service(tmp_path)
    first = _source(tmp_path, "a.png", PNG_HEADER)
    service.finalize(owner_id="user-1", original_name="a.png", source=first, size=600_000)
    second = _source(tmp_path, "b.png", PNG_HEADER)
    with pytest.raises(QuotaExceededError):
        service.finalize(owner_id="user-1", original_name="b.png", source=second, size=600_000)


def test_get_ignores_traversal_ids(tmp_path) -> None:
    service = _service(tmp_path)
    assert service.get("../../etc/passwd") is None
    assert service.get("../secret") is None


def test_resolve_rejects_path_escape(tmp_path) -> None:
    service = _service(tmp_path)
    evil = UploadRecord(
        id="x",
        owner_id="user-1",
        original_name="x",
        content_type="text/plain",
        size=1,
        path="../../outside.png",
        uploaded_at=datetime.now(UTC),
    )
    with pytest.raises(UploadNotFoundError):
        service.resolve(evil)


def test_delete_requires_owner(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "a.png", PNG_HEADER)
    record = service.finalize(owner_id="user-1", original_name="a.png", source=src, size=len(PNG_HEADER))
    with pytest.raises(ForbiddenError):
        service.delete("user-2", record.id)
    assert service.delete("user-1", record.id) is True
    assert service.get(record.id) is None


def test_display_name_sanitized(tmp_path) -> None:
    service = _service(tmp_path)
    src = _source(tmp_path, "a.png", PNG_HEADER)
    record = service.finalize(owner_id="user-1", original_name='..\\"evil"\r\n.png', source=src, size=len(PNG_HEADER))
    assert '"' not in record.original_name
    assert "\r" not in record.original_name


def test_extension_case_insensitive() -> None:
    assert extension_of("PHOTO.PNG") == "png"
    assert extension_of("archive.ZIP") == "zip"
    assert extension_of("noext") == ""


def test_upload_router_exposes_routes() -> None:
    from app.api.v1.routes.uploads import router

    paths = {route.path for route in router.routes}
    assert "/uploads" in paths
    assert "/uploads/{upload_id}" in paths
