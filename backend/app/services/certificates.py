import html
import importlib.util
import io
import re
import uuid
from dataclasses import dataclass
from datetime import date
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.logging import get_logger
from app.models.registration import Registration
from app.models.submission import Submission
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.repositories.hackathon import HackathonRepository
from app.repositories.registration import RegistrationRepository
from app.repositories.submission import SubmissionRepository
from app.repositories.team import TeamRepository

CERTIFICATE_WIDTH = 1600
CERTIFICATE_HEIGHT = 1100

logger = get_logger("certificates")

_FONT_CANDIDATES = (
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
)


@dataclass(frozen=True)
class Certificate:
    registration_id: uuid.UUID
    hackathon_id: uuid.UUID
    hackathon_title: str
    participant_name: str
    team_name: str
    eligible: bool
    format: str
    filename: str
    issued_date: str


def _slugify(value: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9]+", "-", value).strip("-").lower()
    return slug or "certificate"


def _xml_escape(value: str) -> str:
    return html.escape(value, quote=True)


def _png_supported() -> bool:
    return importlib.util.find_spec("PIL") is not None


def _find_font() -> str | None:
    for path in _FONT_CANDIDATES:
        if Path(path).is_file():
            return path
    return None


class CertificateService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._reg_repo = RegistrationRepository(session)
        self._team_repo = TeamRepository(session)
        self._submission_repo = SubmissionRepository(session)
        self._hackathon_repo = HackathonRepository(session)

    async def list_for_user(self, user: User) -> list[Certificate]:
        registrations = await self._reg_repo.list_by_user(user.id)
        certificates = []
        for registration in registrations:
            if registration.status != "CONFIRMED":
                continue
            certificates.append(await self._build_certificate(user, registration))
        return certificates

    async def get_for_user(self, user: User, registration_id: str) -> Certificate:
        registration = await self._reg_repo.get_by_id(registration_id)
        if registration is None:
            raise NotFoundError()
        if str(registration.user_id) != str(user.id):
            raise ForbiddenError()
        return await self._build_certificate(user, registration)

    async def download(self, user: User, registration_id: str) -> tuple[bytes, str, str]:
        certificate = await self.get_for_user(user, registration_id)
        if not certificate.eligible:
            raise ForbiddenError("Certificate is available only after submitting a project")
        content, media_type, filename = await run_in_threadpool(self._materialize, certificate)
        return content, media_type, filename

    async def _build_certificate(self, user: User, registration: Registration) -> Certificate:
        hackathon = await self._hackathon_repo.get_by_id(registration.hackathon_id)
        team, submission = await self._find_team_and_submission(user.id, registration.hackathon_id)
        eligible = submission is not None and submission.status != "DRAFT"
        hackathon_title = hackathon.title if hackathon is not None else "Hackathon"
        team_name = (team.name if team is not None else None) or registration.team_name or ""
        fmt = "png" if _png_supported() else "svg"
        return Certificate(
            registration_id=registration.id,
            hackathon_id=registration.hackathon_id,
            hackathon_title=hackathon_title,
            participant_name=user.name,
            team_name=team_name,
            eligible=eligible,
            format=fmt,
            filename=f"{_slugify(hackathon_title)}-certificate-{_slugify(user.name)}.{fmt}",
            issued_date=date.today().strftime("%d %B %Y"),
        )

    async def _find_team_and_submission(
        self, user_id: uuid.UUID, hackathon_id: uuid.UUID
    ) -> tuple[Team | None, Submission | None]:
        result = await self._session.execute(
            select(TeamMember)
            .join(Team, Team.id == TeamMember.team_id)
            .where(TeamMember.user_id == uuid.UUID(str(user_id)), Team.hackathon_id == uuid.UUID(str(hackathon_id)))
        )
        members = list(result.scalars().all())
        if not members:
            return None, None
        team = await self._team_repo.get_by_id(members[0].team_id)
        submission = await self._submission_repo.get_by_team(members[0].team_id)
        return team, submission

    def _materialize(self, certificate: Certificate) -> tuple[bytes, str, str]:
        directory = Path(settings.CERTIFICATE_DIR)
        directory.mkdir(parents=True, exist_ok=True)
        path = directory / certificate.filename
        if not path.exists():
            path.write_bytes(self._render(certificate))
        content = path.read_bytes()
        media_type = "image/png" if certificate.format == "png" else "image/svg+xml"
        return content, media_type, certificate.filename

    def _render(self, certificate: Certificate) -> bytes:
        if certificate.format == "png":
            try:
                return self._render_png(certificate)
            except Exception as exc:  # noqa: BLE001 - fall back to SVG when PIL rendering fails
                logger.warning("png certificate rendering failed, falling back to svg", error=str(exc))
        return self._render_svg(certificate).encode("utf-8")

    def _render_svg(self, certificate: Certificate) -> str:
        participant = _xml_escape(certificate.participant_name)
        team = _xml_escape(certificate.team_name)
        hackathon = _xml_escape(certificate.hackathon_title)
        team_line = f"as a member of team {team}" if team else "for outstanding participation"
        lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{CERTIFICATE_WIDTH}" height="{CERTIFICATE_HEIGHT}" viewBox="0 0 {CERTIFICATE_WIDTH} {CERTIFICATE_HEIGHT}">',  # noqa: E501
            f'  <rect width="{CERTIFICATE_WIDTH}" height="{CERTIFICATE_HEIGHT}" fill="#FFFFFF"/>',
            '  <rect x="48" y="48" width="1504" height="1004" fill="none" stroke="#800000" stroke-width="6" rx="16"/>',
            '  <rect x="64" y="64" width="1472" height="972" fill="none" stroke="#800000" stroke-width="2" rx="10"/>',
            '  <text x="800" y="190" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="30" letter-spacing="10" fill="#777777">ZAPSTERS HACKATHON PLATFORM</text>',  # noqa: E501
            '  <text x="800" y="330" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="54" letter-spacing="6" fill="#800000" font-weight="bold">CERTIFICATE OF PARTICIPATION</text>',  # noqa: E501
            '  <text x="800" y="430" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="26" fill="#555555">This certificate is proudly presented to</text>',  # noqa: E501
            f'  <text x="800" y="560" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="72" fill="#111111" font-weight="bold">{participant}</text>',  # noqa: E501
            '  <line x1="360" y1="600" x2="1240" y2="600" stroke="#E5E5E2" stroke-width="2"/>',
            f'  <text x="800" y="680" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="26" fill="#555555">for {team_line}</text>',  # noqa: E501
            f'  <text x="800" y="760" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="40" fill="#800000" font-weight="bold">{hackathon}</text>',  # noqa: E501
            f'  <text x="800" y="840" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="24" fill="#777777">Issued on {certificate.issued_date}</text>',  # noqa: E501
            '</svg>',
        ]
        return "\n".join(lines)

    def _render_png(self, certificate: Certificate) -> bytes:
        from PIL import Image, ImageDraw, ImageFont

        image = Image.new("RGB", (CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT), "white")
        draw = ImageDraw.Draw(image)
        font_path = _find_font()
        if font_path is not None:
            display = ImageFont.truetype(font_path, 64)
            heading = ImageFont.truetype(font_path, 48)
            body = ImageFont.truetype(font_path, 28)
        else:
            display = heading = body = ImageFont.load_default()
        draw.rectangle((48, 48, 1552, 1052), outline="#800000", width=6)
        draw.rectangle((64, 64, 1536, 1036), outline="#800000", width=2)
        self._draw_centered(draw, (800, 190), "ZAPSTERS HACKATHON PLATFORM", body, "#777777", 8)
        self._draw_centered(draw, (800, 330), "CERTIFICATE OF PARTICIPATION", heading, "#800000")
        self._draw_centered(draw, (800, 430), "This certificate is proudly presented to", body, "#555555")
        self._draw_centered(draw, (800, 560), certificate.participant_name, display, "#111111")
        draw.line((360, 600, 1240, 600), fill="#E5E5E2", width=2)
        team_line = (
            f"as a member of team {certificate.team_name}" if certificate.team_name else "for outstanding participation"
        )
        self._draw_centered(draw, (800, 680), team_line, body, "#555555")
        self._draw_centered(draw, (800, 760), certificate.hackathon_title, heading, "#800000")
        self._draw_centered(draw, (800, 840), f"Issued on {certificate.issued_date}", body, "#777777")
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return buffer.getvalue()

    @staticmethod
    def _draw_centered(draw, center: tuple[int, int], text: str, font, fill: str, letter_spacing: int = 0) -> None:
        x, y = center
        if letter_spacing:
            widths = [draw.textlength(char, font=font) + letter_spacing for char in text]
            total = sum(widths) - letter_spacing
            cursor = x - total / 2
            for char, char_width in zip(text, widths, strict=False):
                draw.text((cursor, y), char, font=font, fill=fill)
                cursor += char_width
            return
        width = draw.textlength(text, font=font)
        draw.text((x - width / 2, y), text, font=font, fill=fill)
