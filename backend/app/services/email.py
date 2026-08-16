from __future__ import annotations

import hashlib
import html
import urllib.parse
from typing import Protocol

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("email")

RESEND_API_URL = "https://api.resend.com/emails"


class EmailBackend(Protocol):
    """Transport abstraction: any SMTP or HTTP API sender implements this."""

    async def send(self, *, to: str, subject: str, html_body: str) -> None: ...


class ResendEmailBackend:
    """Sends email through the Resend HTTP API."""

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    async def send(self, *, to: str, subject: str, html_body: str) -> None:
        import httpx

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                RESEND_API_URL,
                headers={"Authorization": f"Bearer {self._api_key}"},
                json={
                    "from": settings.EMAIL_FROM,
                    "to": [to],
                    "subject": subject,
                    "html": html_body,
                },
            )
            response.raise_for_status()


class LogEmailBackend:
    """No-op backend for development when RESEND_API_KEY is not configured.

    Logs only a hashed recipient so signup/reset flows still work without email
    infrastructure while honouring SOP §10 (never log raw email addresses).
    """

    async def send(self, *, to: str, subject: str, html_body: str) -> None:
        logger.info("email would be sent", recipient_hash=_hash_email(to), subject=subject)


class EmailService:
    def __init__(self) -> None:
        api_key = settings.RESEND_API_KEY.get_secret_value() if settings.RESEND_API_KEY else None
        self._backend: EmailBackend = ResendEmailBackend(api_key) if api_key else LogEmailBackend()

    async def send_verification_email(self, to: str, token: str) -> None:
        await self._backend.send(
            to=to,
            subject="Verify your Zapsters account",
            html_body=_template(
                title="Confirm your email",
                preheader="You're one step away from verifying your Zapsters account.",
                body=(
                    "Welcome to Zapsters. Click the button below to confirm your email "
                    "address and finish setting up your account. This link expires in 24 hours."
                ),
                cta_label="Verify Email",
                cta_url=_frontend_url("verify-email", token),
                footer_text="If you did not create a Zapsters account, you can safely ignore this email.",
            ),
        )

    async def send_password_reset_email(self, to: str, token: str) -> None:
        await self._backend.send(
            to=to,
            subject="Reset your Zapsters password",
            html_body=_template(
                title="Reset your password",
                preheader="Use the link below to set a new password for your Zapsters account.",
                body=(
                    "We received a request to reset the password for your Zapsters account. "
                    "Click the button below to choose a new one. This link expires in 30 minutes."
                ),
                cta_label="Reset Password",
                cta_url=_frontend_url("reset-password", token),
                footer_text="If you did not request a password reset, you can safely ignore this email.",
            ),
        )


def _frontend_url(path: str, token: str) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    return f"{base}/{path}?token={urllib.parse.quote(token, safe='')}"


def _hash_email(email: str) -> str:
    return hashlib.sha256(email.lower().encode("utf-8")).hexdigest()[:16]


def _template(
    *,
    title: str,
    preheader: str,
    body: str,
    cta_label: str,
    cta_url: str,
    footer_text: str,
) -> str:
    href = html.escape(cta_url)
    return f"""\
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f5f5f3;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">{html.escape(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f3;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:24px;border:1px solid #e5e5e2;overflow:hidden;">
            <tr>
              <td style="padding:40px 32px 8px 32px;text-align:center;">
                <div style="font-size:20px;font-weight:700;color:#800000;letter-spacing:0.04em;">ZAPSTERS</div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;">
                <h1 style="margin:0;font-size:22px;font-weight:700;color:#111111;">{html.escape(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0 32px;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:#555555;">{html.escape(body)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0 32px;text-align:center;">
                <a href="{href}" style="display:inline-block;background-color:#800000;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:9999px;">{html.escape(cta_label)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0 32px;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#999999;">
                  If the button does not work, copy this link into your browser:<br/>
                  <span style="color:#800000;word-break:break-all;">{href}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 40px 32px;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#999999;">{html.escape(footer_text)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
