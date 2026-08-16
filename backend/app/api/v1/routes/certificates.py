import uuid

from fastapi import APIRouter, Response
from pydantic import BaseModel

from app.api.deps import CurrentUser, SessionDep
from app.services.certificates import Certificate, CertificateService

router = APIRouter(prefix="/certificates", tags=["certificates"])


class CertificateRead(BaseModel):
    registration_id: uuid.UUID
    hackathon_id: uuid.UUID
    hackathon_title: str
    participant_name: str
    team_name: str
    eligible: bool
    format: str
    filename: str
    issued_date: str


@router.get("", response_model=list[CertificateRead])
async def list_my_certificates(session: SessionDep, current_user: CurrentUser) -> list[CertificateRead]:
    certificates = await CertificateService(session).list_for_user(current_user)
    return [_to_read(c) for c in certificates]


@router.get("/{registration_id}", response_model=CertificateRead)
async def get_certificate(registration_id: str, session: SessionDep, current_user: CurrentUser) -> CertificateRead:
    certificate = await CertificateService(session).get_for_user(current_user, registration_id)
    return _to_read(certificate)


@router.get("/{registration_id}/download")
async def download_certificate(registration_id: str, session: SessionDep, current_user: CurrentUser) -> Response:
    content, media_type, filename = await CertificateService(session).download(current_user, registration_id)
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _to_read(certificate: Certificate) -> CertificateRead:
    return CertificateRead(
        registration_id=certificate.registration_id,
        hackathon_id=certificate.hackathon_id,
        hackathon_title=certificate.hackathon_title,
        participant_name=certificate.participant_name,
        team_name=certificate.team_name,
        eligible=certificate.eligible,
        format=certificate.format,
        filename=certificate.filename,
        issued_date=certificate.issued_date,
    )
