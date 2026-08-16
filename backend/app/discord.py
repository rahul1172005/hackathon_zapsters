"""Discord bridge: forward hackathon announcements to Discord and answer chat commands.

Standalone, dependency-light module — it uses only the Python standard library
(``urllib``), so no rebuild or new dependency is required; the full ``discord.py``
gateway (presence, slash commands, live message events) is intentionally out of
scope. What this module provides:

* ``WebhookClient`` — post messages and announcement embeds to a Discord channel
  via the configured webhook URL.
* ``BackendClient`` — read-only HTTP client for the public hackathon API.
* ``handle_command`` — answer ``!help``, ``!teams``, ``!schedule``,
  ``!leaderboard`` and ``!announcements`` by querying the backend.
* ``AnnouncementPoller`` — asyncio loop that polls the announcements endpoint and
  forwards each new announcement to the Discord webhook.

Configuration lives in ``backend/.env`` (see ``app/core/config.py``):

* ``DISCORD_BOT_TOKEN`` — gateway credential, reserved for a future discord.py
  integration (not used by the webhook path).
* ``DISCORD_ANNOUNCEMENT_WEBHOOK_URL`` — webhook that announcements are posted to.
* ``BACKEND_BASE_URL`` — origin of the FastAPI backend (default ``http://localhost:8000``).

Run from ``backend/``:

    uv run python -m app.discord poll --hackathon quantum-build-2026
    uv run python -m app.discord announce --title "Hackathon is live" --body "..."

The webhook URL and bot token are ``SecretStr`` settings and are never logged.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

DEFAULT_HACKATHON_SLUG = "quantum-build-2026"
DEFAULT_POLL_INTERVAL_SECONDS = 60.0
DISCORD_MESSAGE_LIMIT = 2000
EMBED_DESCRIPTION_LIMIT = 4000


class DiscordBridgeError(Exception):
    """Raised when the backend API or a Discord webhook cannot be reached."""


def _quote(value: str) -> str:
    return urllib.parse.quote(value, safe="")


def _decode(raw: bytes) -> list[dict[str, Any]] | dict[str, Any]:
    if not raw:
        return {}
    return json.loads(raw.decode("utf-8"))


def _assert_http_url(url: str) -> None:
    scheme = urllib.parse.urlsplit(url).scheme.lower()
    if scheme not in {"http", "https"}:
        raise DiscordBridgeError(f"Only http(s) URLs are allowed, got {scheme}")


def _get_json(url: str, *, timeout: float = 10.0) -> list[dict[str, Any]] | dict[str, Any]:
    _assert_http_url(url)
    request = urllib.request.Request(url, method="GET")  # noqa: S310
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310  # nosec
            return _decode(response.read())
    except urllib.error.HTTPError as exc:
        raise DiscordBridgeError(f"Backend returned HTTP {exc.code}") from exc
    except urllib.error.URLError as exc:
        raise DiscordBridgeError(f"Backend unreachable: {exc.reason}") from exc
    except json.JSONDecodeError as exc:
        raise DiscordBridgeError("Backend returned invalid JSON") from exc


def _post_json(url: str, payload: dict[str, Any], *, timeout: float = 10.0) -> list[dict[str, Any]] | dict[str, Any]:
    _assert_http_url(url)
    request = urllib.request.Request(  # noqa: S310
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310  # nosec
            return _decode(response.read())
    except urllib.error.HTTPError as exc:
        raise DiscordBridgeError(f"Discord webhook returned HTTP {exc.code}") from exc
    except urllib.error.URLError as exc:
        raise DiscordBridgeError(f"Discord webhook unreachable: {exc.reason}") from exc
    except json.JSONDecodeError as exc:
        raise DiscordBridgeError("Discord webhook returned invalid JSON") from exc


class WebhookClient:
    """Posts messages and announcement embeds to a Discord webhook."""

    def __init__(self, webhook_url: str | None = None) -> None:
        self._webhook_url = webhook_url

    @classmethod
    def from_settings(cls) -> WebhookClient:
        configured = settings.DISCORD_ANNOUNCEMENT_WEBHOOK_URL
        return cls(configured.get_secret_value() if configured else None)

    @property
    def configured(self) -> bool:
        return bool(self._webhook_url)

    def send(self, content: str, *, embed: dict[str, Any] | None = None) -> None:
        if not self._webhook_url:
            raise DiscordBridgeError("DISCORD_ANNOUNCEMENT_WEBHOOK_URL is not configured")
        if len(content) > DISCORD_MESSAGE_LIMIT:
            content = content[: DISCORD_MESSAGE_LIMIT - 3] + "..."
        payload: dict[str, Any] = {"content": content}
        if embed:
            payload["embeds"] = [embed]
        _post_json(self._webhook_url, payload)
        logger.info("discord.message.sent", chars=len(content))

    def send_announcement(self, title: str, body: str | None = None, *, footer: str | None = None) -> None:
        self.send(
            "New announcement",
            embed={
                "type": "rich",
                "title": title[:256],
                "description": (body or "")[:EMBED_DESCRIPTION_LIMIT],
                "footer": {"text": (footer or "Zapsters announcement")[:2000]},
            },
        )


class BackendClient:
    """Read-only HTTP client for the public hackathon API endpoints."""

    def __init__(self, base_url: str | None = None) -> None:
        self._base = (base_url or settings.BACKEND_BASE_URL).rstrip("/")

    def hackathons(self) -> list[dict[str, Any]]:
        data = _get_json(f"{self._base}/api/v1/hackathons")
        return data if isinstance(data, list) else []

    def hackathon(self, slug: str) -> dict[str, Any]:
        data = _get_json(f"{self._base}/api/v1/hackathons/{_quote(slug)}")
        if not isinstance(data, dict):
            raise DiscordBridgeError(f"Unexpected response for hackathon {slug}")
        return data

    def teams(self, hackathon_id: str | None = None) -> list[dict[str, Any]]:
        query = f"?hackathon_id={_quote(hackathon_id)}" if hackathon_id else ""
        data = _get_json(f"{self._base}/api/v1/teams{query}")
        return data if isinstance(data, list) else []

    def leaderboard(self, hackathon_id: str | None = None) -> list[dict[str, Any]]:
        query = f"?hackathon_id={_quote(hackathon_id)}" if hackathon_id else ""
        data = _get_json(f"{self._base}/api/v1/leaderboard{query}")
        return data if isinstance(data, list) else []

    def announcements(self, hackathon_id: str) -> list[dict[str, Any]]:
        data = _get_json(f"{self._base}/api/v1/hackathons/{_quote(hackathon_id)}/announcements")
        return data if isinstance(data, list) else []


COMMANDS = {
    "!help": "List available commands",
    "!teams [slug]": "List teams for a hackathon (default: seed hackathon)",
    "!schedule [slug]": "Show the hackathon schedule and timeline",
    "!leaderboard [slug]": "Show the current leaderboard",
    "!announcements [slug]": "List the most recent announcements",
}


def _truncate(text: str, limit: int = DISCORD_MESSAGE_LIMIT) -> str:
    return text if len(text) <= limit else text[: limit - 3] + "..."


def _format_help() -> str:
    lines = [f"**{command}** — {description}" for command, description in COMMANDS.items()]
    return _truncate("Available commands:\n" + "\n".join(lines))


def _format_teams(teams: list[dict[str, Any]]) -> str:
    if not teams:
        return "No teams found."
    lines = ["**Teams**"]
    for team in teams[:25]:
        lines.append(
            f"- {team.get('name', '?')} (`{team.get('slug', '?')}`) · {team.get('track') or 'no track'} · "
            f"{team.get('status', '?')} · rank {team.get('rank')} · score {team.get('score')}"
        )
    return _truncate("\n".join(lines))


def _format_leaderboard(teams: list[dict[str, Any]]) -> str:
    if not teams:
        return "No leaderboard data yet."
    lines = ["**Leaderboard**"]
    for team in teams[:15]:
        lines.append(
            f"{team.get('rank')}. **{team.get('name', '?')}** — {team.get('score')} ({team.get('score_trend')})"
        )
    return _truncate("\n".join(lines))


def _format_schedule(hackathon: dict[str, Any]) -> str:
    title = hackathon.get("title") or hackathon.get("slug")
    lines = [
        f"**{title}** · {hackathon.get('status', '?')}",
        f"Location: {hackathon.get('location') or 'TBD'} · Prize pool: {hackathon.get('prize_pool') or 'TBD'}",
    ]
    timeline = hackathon.get("timeline") or []
    if timeline:
        lines.append("**Schedule**")
        for phase in timeline:
            lines.append(f"- {phase.get('name', '?')} — {phase.get('date', '?')} ({phase.get('status', '?')})")
    else:
        lines.append(f"Runs {hackathon.get('start_date')} → {hackathon.get('end_date')}")
    return _truncate("\n".join(lines))


def _format_announcements(announcements: list[dict[str, Any]]) -> str:
    if not announcements:
        return "No announcements yet."
    lines = ["**Announcements**"]
    for announcement in announcements[:10]:
        body = (announcement.get("body") or "").replace("\n", " ")
        lines.append(f"- {announcement.get('title', '?')}" + (f": {body[:120]}" if body else ""))
    return _truncate("\n".join(lines))


def handle_command(message: str) -> str:
    """Answer a Discord chat command by querying the backend API.

    Returns the message text to post back to the channel, or an empty string when
    the message is not a command (so the bot stays silent). User input never
    crashes the handler — errors are rendered as a short reply.
    """
    parts = message.strip().split()
    if not parts:
        return ""
    command = parts[0].lower()
    slug = parts[1] if len(parts) > 1 else DEFAULT_HACKATHON_SLUG
    client = BackendClient()
    try:
        if command == "!help":
            return _format_help()
        if command == "!teams":
            return _format_teams(client.teams(slug))
        if command == "!schedule":
            return _format_schedule(client.hackathon(slug))
        if command == "!leaderboard":
            return _format_leaderboard(client.leaderboard(slug))
        if command == "!announcements":
            return _format_announcements(client.announcements(slug))
    except DiscordBridgeError as exc:
        logger.warning("discord.command.failed", command=command, error=str(exc))
        return f"Something went wrong: {exc}"
    return ""


class AnnouncementPoller:
    """Poll the announcements endpoint and forward each new one to Discord."""

    def __init__(
        self,
        *,
        hackathon_slug: str = DEFAULT_HACKATHON_SLUG,
        interval_seconds: float = DEFAULT_POLL_INTERVAL_SECONDS,
        webhook: WebhookClient | None = None,
        backend: BackendClient | None = None,
        state_file: str | None = None,
    ) -> None:
        self._hackathon_slug = hackathon_slug
        self._interval_seconds = interval_seconds
        self._webhook = webhook or WebhookClient.from_settings()
        self._backend = backend or BackendClient()
        self._state_file = state_file
        self._seen: set[str] = set(self._load_state())

    def _load_state(self) -> list[str]:
        if not self._state_file:
            return []
        try:
            with open(self._state_file, encoding="utf-8") as handle:
                return json.load(handle)
        except (OSError, ValueError):
            return []

    def _save_state(self) -> None:
        if not self._state_file:
            return
        try:
            with open(self._state_file, "w", encoding="utf-8") as handle:
                json.dump(sorted(self._seen), handle)
        except OSError as exc:
            logger.warning("discord.poller.state_save_failed", error=str(exc))

    def _poll_once(self) -> int:
        if not self._webhook.configured:
            raise DiscordBridgeError("DISCORD_ANNOUNCEMENT_WEBHOOK_URL is not configured")
        announcements = self._backend.announcements(self._hackathon_slug)
        sent = 0
        for announcement in announcements:
            announcement_id = str(announcement.get("id", ""))
            if not announcement_id or announcement_id in self._seen:
                continue
            self._seen.add(announcement_id)
            self._webhook.send_announcement(
                announcement.get("title", "New announcement"),
                announcement.get("body"),
                footer=f"{self._hackathon_slug} · {announcement.get('created_at', '')}",
            )
            sent += 1
        self._save_state()
        return sent

    async def run_forever(self) -> None:
        logger.info(
            "discord.poller.started",
            hackathon_slug=self._hackathon_slug,
            interval_seconds=self._interval_seconds,
        )
        while True:
            try:
                await asyncio.to_thread(self._poll_once)
            except DiscordBridgeError as exc:
                logger.warning("discord.poller.error", error=str(exc))
            await asyncio.sleep(self._interval_seconds)


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Zapsters Discord bridge")
    subparsers = parser.add_subparsers(dest="command", required=True)

    poll = subparsers.add_parser("poll", help="Poll announcements and forward new ones to Discord")
    poll.add_argument("--hackathon", default=DEFAULT_HACKATHON_SLUG)
    poll.add_argument("--interval", type=float, default=DEFAULT_POLL_INTERVAL_SECONDS)
    poll.add_argument("--state-file")

    announce = subparsers.add_parser("announce", help="Send a single announcement to Discord")
    announce.add_argument("--title", required=True)
    announce.add_argument("--body")

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv if argv is not None else sys.argv[1:])
    if args.command == "announce":
        webhook = WebhookClient.from_settings()
        webhook.send_announcement(args.title, args.body)
        return
    poller = AnnouncementPoller(
        hackathon_slug=args.hackathon,
        interval_seconds=args.interval,
        state_file=args.state_file,
    )
    asyncio.run(poller.run_forever())


if __name__ == "__main__":
    main()
