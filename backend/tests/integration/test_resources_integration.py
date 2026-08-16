"""Integration tests for team/submission/evaluation/registration/leaderboard/organization routes."""

import uuid

import pytest
from httpx import AsyncClient

from app.models.hackathon import Hackathon
from app.models.organization import Organization
from app.models.team import Team
from app.schemas.hackathon import HackathonCreate
from tests.integration.test_auth_integration import REGISTER


async def _register_and_login(client: AsyncClient, **overrides) -> str:
    payload = {**REGISTER, **overrides}
    await client.post("/api/v1/auth/register", json=payload)
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    return login.json()["access_token"]


async def _register_and_get_user_id(client: AsyncClient, **overrides) -> tuple[str, str]:
    token = await _register_and_login(client, **overrides)
    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    return token, me.json()["id"]


async def _create_hackathon(client: AsyncClient, token: str) -> dict:
    resp = await client.post(
        "/api/v1/hackathons",
        json={
            "slug": "seed-hack-2026",
            "title": "Seed Hack 2026",
            "status": "LIVE",
            "is_online": True,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    return resp.json()


async def _seed_team(db_session, hackathon_id, slug: str = "seed-team", score: float = 0.0, rank: int = 0) -> Team:
    team = Team(slug=slug, name="Seed Team", hackathon_id=hackathon_id, score=score, rank=rank)
    db_session.add(team)
    await db_session.commit()
    await db_session.refresh(team)
    return team


async def _seed_team_with_member(db_session, hackathon_id, user_id, slug: str = "seed-team") -> Team:
    from app.models.team_member import TeamMember

    team = await _seed_team(db_session, hackathon_id, slug=slug)
    db_session.add(TeamMember(team_id=team.id, user_id=uuid.UUID(user_id), role="lead", contribution_percentage=100))
    await db_session.commit()
    return team


@pytest.mark.asyncio
async def test_team_detail_flow(client: AsyncClient, db_session) -> None:
    token = await _register_and_login(client)
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team(db_session, uuid.UUID(hackathon["id"]))

    filtered = await client.get("/api/v1/teams", params={"hackathon_id": hackathon["id"]})
    assert filtered.status_code == 200
    assert len(filtered.json()) == 1

    detail = await client.get(f"/api/v1/teams/{team.slug}")
    assert detail.status_code == 200
    body = detail.json()
    assert body["name"] == "Seed Team"
    assert body["members"] == []
    assert body["tasks"] == []
    assert body["project"] is None

    missing = await client.get("/api/v1/teams/does-not-exist")
    assert missing.status_code == 404


@pytest.mark.asyncio
async def test_team_detail_not_found_returns_404(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/teams/nope")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_submission_create_and_update(client: AsyncClient, db_session) -> None:
    token, user_id = await _register_and_get_user_id(client)
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team_with_member(db_session, uuid.UUID(hackathon["id"]), user_id)

    payload = {
        "team_id": str(team.id),
        "hackathon_id": hackathon["id"],
        "track": "AI",
        "project_name": "Project Aurora",
        "tech_stack": ["Python", "React"],
    }
    created = await client.post("/api/v1/submissions", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert created.status_code == 201
    assert created.json()["status"] == "DRAFT"
    assert created.json()["project_name"] == "Project Aurora"

    updated = await client.post(
        "/api/v1/submissions",
        json={**payload, "project_name": "Project Aurora v2"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert updated.status_code == 201
    assert updated.json()["project_name"] == "Project Aurora v2"

    listed = await client.get("/api/v1/submissions", params={"hackathon_id": hackathon["id"]})
    assert listed.status_code == 200
    assert len(listed.json()) == 1


@pytest.mark.asyncio
async def test_submission_rejects_non_member(client: AsyncClient, db_session) -> None:
    token, _user1 = await _register_and_get_user_id(client)
    token2, user2 = await _register_and_get_user_id(client, email="other@example.com", username="otheruser")
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team_with_member(db_session, uuid.UUID(hackathon["id"]), user2, slug="other-team")

    resp = await client.post(
        "/api/v1/submissions",
        json={
            "team_id": str(team.id),
            "hackathon_id": hackathon["id"],
            "project_name": "Not My Team",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_submission_submit_flow(client: AsyncClient, db_session) -> None:
    token, user_id = await _register_and_get_user_id(client)
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team_with_member(db_session, uuid.UUID(hackathon["id"]), user_id)

    await client.post(
        "/api/v1/submissions",
        json={
            "team_id": str(team.id),
            "hackathon_id": hackathon["id"],
            "project_name": "Final Build",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    submitted = await client.post(
        f"/api/v1/submissions/{team.id}/submit",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert submitted.status_code == 200
    assert submitted.json()["status"] == "SUBMITTED"

    dup = await client.post(
        f"/api/v1/submissions/{team.id}/submit",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dup.status_code == 409


@pytest.mark.asyncio
async def test_submission_requires_auth(client: AsyncClient, db_session) -> None:
    resp = await client.post(
        "/api/v1/submissions",
        json={"team_id": str(uuid.uuid4()), "hackathon_id": str(uuid.uuid4()), "project_name": "X"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_registration_flow(client: AsyncClient) -> None:
    token = await _register_and_login(client)
    hackathon = await _create_hackathon(client, token)

    resp = await client.post(
        "/api/v1/registrations",
        json={"hackathon_id": hackathon["id"], "team_name": "Team Spark", "track": "Robotics", "team_size": 3},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "CONFIRMED"
    assert body["payment_status"] == "NONE"

    dup = await client.post(
        "/api/v1/registrations",
        json={"hackathon_id": hackathon["id"], "team_name": "Team Spark"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dup.status_code == 409

    anon = await client.post(
        "/api/v1/registrations",
        json={"hackathon_id": hackathon["id"], "team_name": "X"},
    )
    assert anon.status_code == 401


@pytest.mark.asyncio
async def test_evaluation_save_and_recompute(client: AsyncClient, db_session) -> None:
    token = await _register_and_login(client)
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team(db_session, uuid.UUID(hackathon["id"]))
    judge_id = await _seed_judge(client, token, hackathon["id"])

    payload = {
        "judge_id": judge_id,
        "team_id": str(team.id),
        "hackathon_id": hackathon["id"],
        "scores": {"innovation": 25, "technical": 20, "impact": 15, "ux": 8, "presentation": 7},
        "notes": "Strong prototype",
        "status": "SUBMITTED",
    }
    resp = await client.post("/api/v1/evaluations", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["total_score"] == 75.0
    assert body["status"] == "SUBMITTED"

    refreshed = await _get_team(db_session, team.id)
    assert refreshed.score == 75.0
    assert refreshed.status == "JUDGING"


async def _seed_judge(client: AsyncClient, token: str, hackathon_id: str) -> str:
    resp = await client.post(
        "/api/v1/judges",
        json={
            "hackathon_id": hackathon_id,
            "name": "Dr. Panel",
            "email": "panel@example.com",
            "organization": "Zapsters Labs",
            "role": "AI Lead",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    return resp.json()["id"]


async def _get_team(db_session, team_id) -> Team:
    team = await db_session.get(Team, team_id)
    assert team is not None
    return team


@pytest.mark.asyncio
async def test_evaluation_get_for_judge_and_team(client: AsyncClient, db_session) -> None:
    token, user_id = await _register_and_get_user_id(client)
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team(db_session, uuid.UUID(hackathon["id"]))

    from app.models.judge import Judge

    judge = Judge(
        id=uuid.UUID(user_id),
        user_id=uuid.UUID(user_id),
        hackathon_id=uuid.UUID(hackathon["id"]),
        name="Dr. Panel",
        email="panel@example.com",
        assigned_teams_count=0,
        completed_count=0,
        remaining_count=0,
    )
    db_session.add(judge)
    await db_session.commit()

    payload = {
        "judge_id": user_id,
        "team_id": str(team.id),
        "hackathon_id": hackathon["id"],
        "scores": {"innovation": 10, "technical": 10, "impact": 10, "ux": 5, "presentation": 5},
        "status": "DRAFT",
    }
    saved = await client.post("/api/v1/evaluations", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert saved.status_code == 201

    resp = await client.get(f"/api/v1/evaluations/team/{team.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["total_score"] == 40.0


@pytest.mark.asyncio
async def test_evaluation_not_found(client: AsyncClient) -> None:
    token = await _register_and_login(client)
    resp = await client.get(f"/api/v1/evaluations/team/{uuid.uuid4()}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_leaderboard_ranks_by_score(client: AsyncClient, db_session) -> None:
    token = await _register_and_login(client)
    hackathon = await _create_hackathon(client, token)
    hackathon_id = uuid.UUID(hackathon["id"])
    low = await _seed_team(db_session, hackathon_id, slug="team-low", score=10.0)
    high = await _seed_team(db_session, hackathon_id, slug="team-high", score=95.0)

    resp = await client.get("/api/v1/leaderboard", params={"hackathon_id": hackathon["id"]})
    assert resp.status_code == 200
    teams = resp.json()
    assert teams[0]["id"] == str(high.id)
    assert teams[0]["rank"] == 1
    assert teams[1]["id"] == str(low.id)
    assert teams[1]["rank"] == 2


@pytest.mark.asyncio
async def test_announcements_flow(client: AsyncClient) -> None:
    token = await _register_and_login(client)
    hackathon = await _create_hackathon(client, token)

    resp = await client.post(
        f"/api/v1/hackathons/{hackathon['id']}/announcements",
        json={"title": "Kickoff at 10 AM", "body": "Bring laptops"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    assert resp.json()["title"] == "Kickoff at 10 AM"

    listed = await client.get(f"/api/v1/hackathons/{hackathon['id']}/announcements")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


@pytest.mark.asyncio
async def test_announcement_requires_auth(client: AsyncClient) -> None:
    resp = await client.post(f"/api/v1/hackathons/{uuid.uuid4()}/announcements", json={"title": "X"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_notifications_list_and_mark_read(client: AsyncClient, db_session) -> None:
    token = await _register_and_login(client)

    empty = await client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {token}"})
    assert empty.status_code == 200
    assert empty.json() == []

    # Seed a notification directly through the DB session.
    from sqlalchemy import select

    from app.models.notification import Notification
    from app.models.user import User

    user_row = await db_session.execute(select(User).where(User.email == REGISTER["email"]))
    user_id = user_row.scalar_one().id

    db_session.add(Notification(user_id=user_id, title="You have a new announcement", type="INFO"))
    await db_session.commit()

    listed = await client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {token}"})
    assert listed.status_code == 200
    assert len(listed.json()) == 1
    assert listed.json()[0]["title"] == "You have a new announcement"
    assert listed.json()[0]["read_at"] is None

    marked = await client.post("/api/v1/notifications/read-all", headers={"Authorization": f"Bearer {token}"})
    assert marked.status_code == 204


@pytest.mark.asyncio
async def test_judges_create_and_list(client: AsyncClient, db_session) -> None:
    token = await _register_and_login(client)
    hackathon = await _create_hackathon(client, token)

    resp = await client.post(
        "/api/v1/judges",
        json={
            "hackathon_id": hackathon["id"],
            "name": "Dr. Panel",
            "email": "panel@example.com",
            "organization": "Zapsters Labs",
            "role": "AI Lead",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["assigned_teams_count"] == 0

    listed = await client.get("/api/v1/judges", params={"hackathon_id": hackathon["id"]})
    assert listed.status_code == 200


@pytest.mark.asyncio
async def test_organization_hackathons(client: AsyncClient, db_session) -> None:
    org = Organization(slug="zapsters-labs", name="Zapsters Labs", description="Hackathon org")
    db_session.add(org)
    await db_session.commit()

    hackathon_row = Hackathon(**HackathonCreate(slug="org-hack-2026", title="Org Hack 2026").model_dump())
    hackathon_row.organization_id = org.id
    db_session.add(hackathon_row)
    await db_session.commit()

    resp = await client.get("/api/v1/organizations/zapsters-labs/hackathons")
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["slug"] == "org-hack-2026"

    missing = await client.get("/api/v1/organizations/no-such-org/hackathons")
    assert missing.status_code == 200
    assert missing.json() == []


@pytest.mark.asyncio
async def test_team_create_join_invite_leave(client: AsyncClient, db_session) -> None:
    token, user1 = await _register_and_get_user_id(client)
    token2, user2 = await _register_and_get_user_id(client, email="joiner@example.com", username="joiner")
    hackathon = await _create_hackathon(client, token)

    created = await client.post(
        "/api/v1/teams",
        json={"slug": "team-alpha", "name": "Alpha", "hackathon_id": hackathon["id"]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert created.status_code == 201
    team_id = created.json()["id"]

    dup = await client.post(
        "/api/v1/teams",
        json={"slug": "team-alpha", "name": "Alpha Again", "hackathon_id": hackathon["id"]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dup.status_code == 409

    invite = await client.post(
        f"/api/v1/teams/{team_id}/invite",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert invite.status_code == 200
    code = invite.json()["invite_code"]
    assert len(code) == 6

    joined = await client.post(
        "/api/v1/teams/join",
        json={"invite_code": code},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert joined.status_code == 201
    assert joined.json()["name"] == "Alpha"

    already = await client.post(
        "/api/v1/teams/join",
        json={"invite_code": code},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert already.status_code == 409

    left = await client.post(
        f"/api/v1/teams/{team_id}/leave",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert left.status_code == 204


@pytest.mark.asyncio
async def test_team_join_invalid_code_404(client: AsyncClient) -> None:
    token = await _register_and_login(client)
    resp = await client.post(
        "/api/v1/teams/join",
        json={"invite_code": "NOPE99"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_team_invite_requires_membership(client: AsyncClient, db_session) -> None:
    token, user1 = await _register_and_get_user_id(client)
    token2, user2 = await _register_and_get_user_id(client, email="intruder@example.com", username="intruder")
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team_with_member(db_session, uuid.UUID(hackathon["id"]), user1, slug="guarded-team")

    resp = await client.post(
        f"/api/v1/teams/{team.id}/invite",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_hackathon_lifecycle_state_machine(client: AsyncClient, db_session) -> None:
    token, _user_id = await _register_and_get_user_id(client)
    hackathon = await _create_hackathon(client, token)

    judging = await client.post(
        f"/api/v1/hackathons/{hackathon['id']}/status",
        params={"status": "JUDGING"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert judging.status_code == 200
    assert judging.json()["status"] == "JUDGING"

    invalid = await client.post(
        f"/api/v1/hackathons/{hackathon['id']}/status",
        params={"status": "OPEN"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert invalid.status_code == 409

    completed = await client.post(
        f"/api/v1/hackathons/{hackathon['id']}/status",
        params={"status": "COMPLETED"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert completed.status_code == 200


@pytest.mark.asyncio
async def test_hackathon_status_requires_owner(client: AsyncClient, db_session) -> None:
    token = await _register_and_login(client)
    token2 = await _register_and_login(client, email="notowner@example.com", username="notowner")
    hackathon = await _create_hackathon(client, token)

    resp = await client.post(
        f"/api/v1/hackathons/{hackathon['id']}/status",
        params={"status": "OPEN"},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_hackathon_rubric_flow(client: AsyncClient, db_session) -> None:
    token, _user_id = await _register_and_get_user_id(client)
    token2 = await _register_and_login(client, email="rubricintruder@example.com", username="rubricintruder")
    hackathon = await _create_hackathon(client, token)

    default = await client.get(f"/api/v1/hackathons/{hackathon['id']}/rubric")
    assert default.status_code == 200
    assert default.json()["innovation"] == 30

    updated = await client.put(
        f"/api/v1/hackathons/{hackathon['id']}/rubric",
        json={"innovation": 40, "technical": 30, "impact": 15, "ux": 10, "presentation": 5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert updated.status_code == 200
    assert updated.json()["innovation"] == 40

    forbidden = await client.put(
        f"/api/v1/hackathons/{hackathon['id']}/rubric",
        json={"innovation": 50, "technical": 20, "impact": 10, "ux": 10, "presentation": 10},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_registration_list_and_cancel(client: AsyncClient, db_session) -> None:
    token, user1 = await _register_and_get_user_id(client)
    hackathon = await _create_hackathon(client, token)

    empty = await client.get("/api/v1/registrations", headers={"Authorization": f"Bearer {token}"})
    assert empty.status_code == 200
    assert empty.json() == []

    reg = await client.post(
        "/api/v1/registrations",
        json={"hackathon_id": hackathon["id"], "team_name": "Cancel Me", "track": "AI", "team_size": 2},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert reg.status_code == 201
    reg_id = reg.json()["id"]

    listed = await client.get("/api/v1/registrations", headers={"Authorization": f"Bearer {token}"})
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    cancelled = await client.post(
        f"/api/v1/registrations/{reg_id}/cancel",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert cancelled.status_code == 200
    assert cancelled.json()["status"] == "CANCELLED"


@pytest.mark.asyncio
async def test_registration_cancel_forbidden_for_other_user(client: AsyncClient, db_session) -> None:
    token, _user1 = await _register_and_get_user_id(client)
    token2, _user2 = await _register_and_get_user_id(client, email="victim@example.com", username="victim")
    hackathon = await _create_hackathon(client, token2)

    reg = await client.post(
        "/api/v1/registrations",
        json={"hackathon_id": hackathon["id"], "team_name": "Mine", "track": "AI", "team_size": 1},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert reg.status_code == 201

    resp = await client.post(
        f"/api/v1/registrations/{reg.json()['id']}/cancel",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_announcement_fan_out_notifications(client: AsyncClient, db_session) -> None:
    token, user1 = await _register_and_get_user_id(client)
    token2, user2 = await _register_and_get_user_id(client, email="subscriber@example.com", username="subscriber")
    hackathon = await _create_hackathon(client, token)

    await client.post(
        "/api/v1/registrations",
        json={"hackathon_id": hackathon["id"], "team_name": "Fan", "track": "AI", "team_size": 2},
        headers={"Authorization": f"Bearer {token2}"},
    )

    announcement = await client.post(
        f"/api/v1/hackathons/{hackathon['id']}/announcements",
        json={"title": "Judging starts soon", "body": "Prepare your demos"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert announcement.status_code == 201

    notifs = await client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {token2}"})
    assert notifs.status_code == 200
    assert len(notifs.json()) == 1
    assert notifs.json()[0]["title"] == "Judging starts soon"
    assert notifs.json()[0]["type"] == "ANNOUNCEMENT"


@pytest.mark.asyncio
async def test_evaluation_uses_custom_rubric(client: AsyncClient, db_session) -> None:
    token, _user_id = await _register_and_get_user_id(client)
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team(db_session, uuid.UUID(hackathon["id"]))
    judge_id = await _seed_judge(client, token, hackathon["id"])

    await client.put(
        f"/api/v1/hackathons/{hackathon['id']}/rubric",
        json={"innovation": 50, "technical": 30, "impact": 10, "ux": 5, "presentation": 5},
        headers={"Authorization": f"Bearer {token}"},
    )

    payload = {
        "judge_id": judge_id,
        "team_id": str(team.id),
        "hackathon_id": hackathon["id"],
        "scores": {"innovation": 40, "technical": 25, "impact": 10, "ux": 5, "presentation": 5},
        "status": "DRAFT",
    }
    resp = await client.post("/api/v1/evaluations", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    assert resp.json()["total_score"] == 85.0


@pytest.mark.asyncio
async def test_evaluation_rejects_over_cap_score(client: AsyncClient, db_session) -> None:
    token, _user_id = await _register_and_get_user_id(client)
    hackathon = await _create_hackathon(client, token)
    team = await _seed_team(db_session, uuid.UUID(hackathon["id"]))
    judge_id = await _seed_judge(client, token, hackathon["id"])

    payload = {
        "judge_id": judge_id,
        "team_id": str(team.id),
        "hackathon_id": hackathon["id"],
        "scores": {"innovation": 31, "technical": 30, "impact": 20, "ux": 10, "presentation": 10},
        "status": "DRAFT",
    }
    resp = await client.post("/api/v1/evaluations", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 422
