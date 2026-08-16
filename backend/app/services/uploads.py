"""Secure local-disk file upload service (SOP §9.3).

Files are validated by their magic bytes, never by the client-supplied
Content-Type or file name; the upload size cap and per-user quota come from
``settings``; stored names are random UUIDs so the original name is never
used to build a path (no path traversal); a small JSON index tracks owners,
sizes, and content types for safe lookups and quota accounting.
"""

import json
import shutil
import threading
import uuid
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from app.core.config import settings
from app.core.exceptions import AppError, ForbiddenError, NotFoundError

UPLOAD_HEADER_LENGTH = 4096
UPLOAD_CHUNK_SIZE = 1024 * 1024


class FileTooLargeError(AppError):
    status_code = 413
    code = "file_too_large"


class FileTypeNotAllowedError(AppError):
    status_code = 415
    code = "unsupported_media_type"


class QuotaExceededError(AppError):
    status_code = 409
    code = "quota_exceeded"


class UploadNotFoundError(NotFoundError):
    code = "upload_not_found"


@dataclass(frozen=True)
class FileTypeRule:
    mime: str
    extensions: tuple[str, ...]
    matches: Callable[[bytes], bool]


def _is_utf8_text(head: bytes) -> bool:
    sample = head[:UPLOAD_HEADER_LENGTH]
    if b"\x00" in sample:
        return False
    try:
        sample.decode("utf-8")
    except UnicodeDecodeError:
        return False
    return True


def _starts_with(*prefixes: bytes) -> Callable[[bytes], bool]:
    return lambda head: head.startswith(prefixes)


def _is_webp(head: bytes) -> bool:
    return len(head) >= 12 and head[:4] == b"RIFF" and head[8:12] == b"WEBP"


def _is_zip(head: bytes) -> bool:
    return head.startswith((b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08"))


def _is_svg(head: bytes) -> bool:
    return _is_utf8_text(head) and b"<svg" in head.lower()


def _is_json(head: bytes) -> bool:
    return _is_utf8_text(head) and head.lstrip()[:1] in (b"{", b"[")


def _is_csv(head: bytes) -> bool:
    if not _is_utf8_text(head):
        return False
    first_line = head.split(b"\n", 1)[0]
    return b"," in first_line or b"\t" in first_line


# Detection order matters only within a type family; the extension chosen by
# the caller selects the rule that the content must satisfy.
FILE_TYPE_RULES: tuple[FileTypeRule, ...] = (
    FileTypeRule("image/png", ("png",), _starts_with(b"\x89PNG\r\n\x1a\n")),
    FileTypeRule("image/jpeg", ("jpg", "jpeg"), _starts_with(b"\xff\xd8\xff")),
    FileTypeRule("image/gif", ("gif",), _starts_with(b"GIF87a", b"GIF89a")),
    FileTypeRule("image/webp", ("webp",), _is_webp),
    FileTypeRule("application/pdf", ("pdf",), _starts_with(b"%PDF-")),
    FileTypeRule("application/zip", ("zip", "docx", "xlsx", "pptx"), _is_zip),
    FileTypeRule("image/svg+xml", ("svg",), _is_svg),
    FileTypeRule("text/csv", ("csv",), _is_csv),
    FileTypeRule("application/json", ("json",), _is_json),
    FileTypeRule("text/plain", ("txt", "md", "log"), _is_utf8_text),
)

ALLOWED_EXTENSIONS: frozenset[str] = frozenset(ext for rule in FILE_TYPE_RULES for ext in rule.extensions)


def extension_of(original_name: str) -> str:
    """Lowercased, dot-stripped file extension derived from a client file name."""
    return Path(original_name or "").suffix.lower().lstrip(".")


def sanitize_display_name(original_name: str) -> str:
    """Strip control characters, quotes, and separators before reflecting a name."""
    cleaned = "".join(ch for ch in (original_name or "") if ord(ch) >= 32 and ch not in '"\r\n\t\\')
    cleaned = cleaned.strip(". ")
    return cleaned[:255] or "upload"


def _safe_component(value: str) -> str:
    cleaned = "".join(ch for ch in str(value) if ch.isalnum() or ch in "_-")
    return cleaned or "anonymous"


@dataclass(frozen=True)
class UploadRecord:
    id: str
    owner_id: str
    original_name: str
    content_type: str
    size: int
    path: str
    uploaded_at: datetime


class UploadService:
    """Stores uploads on local disk under random names and tracks them in a JSON index."""

    def __init__(self, upload_dir: str | Path | None = None) -> None:
        self._upload_dir = Path(upload_dir) if upload_dir is not None else Path(settings.UPLOAD_DIR)
        self._index_path = self._upload_dir / ".uploads.json"
        self._lock = threading.Lock()
        self._upload_dir.mkdir(parents=True, exist_ok=True)

    @property
    def upload_dir(self) -> Path:
        return self._upload_dir

    @staticmethod
    def max_upload_bytes() -> int:
        return settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @staticmethod
    def quota_bytes() -> int:
        return settings.UPLOAD_PER_USER_QUOTA_MB * 1024 * 1024

    def detect_rule(self, original_name: str) -> FileTypeRule | None:
        ext = extension_of(original_name)
        for rule in FILE_TYPE_RULES:
            if ext in rule.extensions:
                return rule
        return None

    def validate(self, *, head: bytes, original_name: str, size: int) -> str:
        """Validate size cap, allowed extension, and magic bytes. Returns the MIME type."""
        if size > self.max_upload_bytes():
            raise FileTooLargeError(f"file exceeds the {settings.MAX_UPLOAD_SIZE_MB} MB upload limit")
        rule = self.detect_rule(original_name)
        if rule is None:
            raise FileTypeNotAllowedError(
                "file type is not allowed (allowed: " + ", ".join(sorted(ALLOWED_EXTENSIONS)) + ")"
            )
        if not rule.matches(head):
            raise FileTypeNotAllowedError(f"file content does not match its {rule.mime} type")
        return rule.mime

    def finalize(
        self,
        *,
        owner_id: str,
        original_name: str,
        source: Path,
        size: int,
    ) -> UploadRecord:
        """Validate a fully streamed temp file, then move it into place under a random name."""
        with source.open("rb") as handle:
            head = handle.read(UPLOAD_HEADER_LENGTH)
        mime = self.validate(head=head, original_name=original_name, size=size)
        ext = extension_of(original_name)
        stored_id = f"{uuid.uuid4().hex}.{ext}"
        owner_segment = _safe_component(owner_id)
        relative_path = Path(owner_segment) / stored_id
        target = self._upload_dir / relative_path

        with self._lock:
            files = self._load_index()
            used = sum(int(item["size"]) for item in files.values() if item["owner_id"] == owner_segment)
            quota = self.quota_bytes()
            if quota > 0 and used + size > quota:
                raise QuotaExceededError(f"per-user upload quota of {settings.UPLOAD_PER_USER_QUOTA_MB} MB exceeded")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(source), str(target))
            files[stored_id] = {
                "owner_id": owner_segment,
                "original_name": sanitize_display_name(original_name),
                "content_type": mime,
                "size": size,
                "path": relative_path.as_posix(),
                "uploaded_at": datetime.now(UTC).isoformat(),
            }
            self._save_index(files)
        return self._to_record(stored_id, files[stored_id])

    def get(self, stored_id: str) -> UploadRecord | None:
        with self._lock:
            files = self._load_index()
            raw = files.get(stored_id)
            return self._to_record(stored_id, raw) if raw is not None else None

    def resolve(self, record: UploadRecord) -> Path:
        """Resolve a record's stored path, refusing anything outside the upload dir."""
        base = self._upload_dir.resolve()
        path = (self._upload_dir / record.path).resolve()
        if not path.is_relative_to(base):
            raise UploadNotFoundError()
        return path

    def is_owner(self, record: UploadRecord, owner_id: str) -> bool:
        return record.owner_id == _safe_component(owner_id)

    def delete(self, owner_id: str, stored_id: str) -> bool:
        with self._lock:
            files = self._load_index()
            raw = files.get(stored_id)
            if raw is None:
                return False
            if raw["owner_id"] != _safe_component(owner_id):
                raise ForbiddenError()
            path = (self._upload_dir / raw["path"]).resolve()
            if path.is_relative_to(self._upload_dir.resolve()):
                path.unlink(missing_ok=True)
            del files[stored_id]
            self._save_index(files)
        return True

    def used_bytes(self, owner_id: str) -> int:
        segment = _safe_component(owner_id)
        with self._lock:
            files = self._load_index()
            return sum(int(item["size"]) for item in files.values() if item["owner_id"] == segment)

    def _load_index(self) -> dict[str, dict]:
        if not self._index_path.exists():
            return {}
        try:
            data = json.loads(self._index_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {}
        return data.get("files", {}) if isinstance(data, dict) else {}

    def _save_index(self, files: dict[str, dict]) -> None:
        tmp = self._index_path.with_name(f".{self._index_path.name}.tmp")
        tmp.write_text(json.dumps({"files": files}, ensure_ascii=True), encoding="utf-8")
        tmp.replace(self._index_path)

    @staticmethod
    def _to_record(stored_id: str, raw: dict) -> UploadRecord:
        return UploadRecord(
            id=stored_id,
            owner_id=raw["owner_id"],
            original_name=raw["original_name"],
            content_type=raw["content_type"],
            size=int(raw["size"]),
            path=raw["path"],
            uploaded_at=datetime.fromisoformat(raw["uploaded_at"]),
        )
