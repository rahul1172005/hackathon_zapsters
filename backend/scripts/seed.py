"""Seed the database from the mock dataset (src/lib/mockData.ts).

Idempotent: if the canonical seed hackathon already exists, it exits early.

Run from backend/:
    uv run python scripts/seed.py
"""

import asyncio
from datetime import UTC, datetime, timedelta

import structlog
from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import async_session_factory, engine
from app.models.activity_item import ActivityItem
from app.models.evaluation import Evaluation
from app.models.hackathon import Hackathon
from app.models.judge import Judge
from app.models.organization import Organization
from app.models.project import Project
from app.models.registration import Registration
from app.models.submission import Submission
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.team_task import TeamTask
from app.models.track import Track
from app.models.user import User

logger = structlog.get_logger()

SEED_ORG_SLUG = "zapsters-labs"
SEED_HACK_SLUG = "quantum-build-2026"
SEED_PASSWORD = "Zapsters#2026!"


async def _org(session, slug: str, name: str) -> Organization:
    result = await session.execute(select(Organization).where(Organization.slug == slug))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    org = Organization(slug=slug, name=name, description=f"{name} hackathon programs")
    session.add(org)
    return org


async def _user(session, username: str, name: str, email: str, roles: list[str] | None = None) -> User:
    result = await session.execute(select(User).where(User.username == username))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    user = User(
        email=email,
        username=username,
        name=name,
        hashed_password=hash_password(SEED_PASSWORD),
        roles=roles or ["participant"],
        skills=[],
        is_verified=True,
    )
    session.add(user)
    return user


async def _hackathon(
    session,
    org: Organization,
    slug: str,
    title: str,
    tagline: str,
    status: str,
    location: str,
    is_online: bool,
    prize_pool: str,
    description: str,
) -> Hackathon:
    result = await session.execute(select(Hackathon).where(Hackathon.slug == slug))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    start = datetime.now(UTC) - timedelta(days=2)
    hack = Hackathon(
        slug=slug,
        title=title,
        tagline=tagline,
        description=description,
        status=status,
        start_date=start,
        end_date=start + timedelta(days=2),
        duration_hours=48,
        location=location,
        is_online=is_online,
        prize_pool=prize_pool,
        participants_count=842,
        teams_count=186,
        active_teams_count=141,
        submission_rate=87,
        judging_rate=63,
        rules=[
            "Teams must consist of 2 to 4 eligible registered hackers.",
            "All code submitted must be written during the hacking window.",
        ],
        faqs=[
            {
                "question": "Who can participate?",
                "answer": "Developers, researchers, hardware engineers, and designers worldwide are welcome.",
            }
        ],
        organization_id=org.id,
    )
    session.add(hack)
    return hack


async def seed() -> None:
    async with async_session_factory() as session:
        org = await _org(session, SEED_ORG_SLUG, "Zapsters Labs")
        cyberforge = await _org(session, "cyberforge-alliance", "CyberForge Alliance")
        await _org(session, "openai-ecosystem", "OpenAI Ecosystem")
        session.add(cyberforge)
        await session.flush()

        admin = await _user(
            session,
            "rahul_dev",
            "Rahul Sharma",
            "rahul@zapsters.dev",
            roles=["participant", "admin"],
        )
        users = [
            await _user(session, "sarah_c", "Sarah Chen", "sarah.chen@example.com"),
            await _user(session, "mvance", "Marcus Vance", "marcus.vance@example.com"),
            await _user(session, "elena_r", "Elena Rostova", "elena.rostova@example.com"),
            await _user(session, "dkim", "David Kim", "david.kim@example.com"),
            await _user(session, "arivera", "Alex Rivera", "alex.rivera@example.com"),
            await _user(session, "psharma", "Priya Sharma", "priya.sharma@example.com"),
            await _user(session, "ksato", "Kenji Sato", "kenji.sato@example.com"),
            await _user(session, "arunk", "Arun Kumar", "arun.kumar@example.com"),
            await _user(session, "vishnu_v", "Vishnu Vardhan", "vishnu.vardhan@example.com"),
            await _user(session, "adithya_n", "Adithya Nair", "adithya.nair@example.com"),
            await _user(session, "rohang", "Rohan Gupta", "rohan.gupta@example.com"),
            await _user(session, "spatel", "Sneha Patel", "sneha.patel@example.com"),
            await _user(session, "vseth", "Vikram Seth", "vikram.seth@example.com"),
            await _user(session, "troy", "Tanya Roy", "tanya.roy@example.com"),
        ]
        await session.flush()

        hack = await _hackathon(
            session,
            org,
            SEED_HACK_SLUG,
            "QUANTUM BUILD 2026",
            "AI • CIVIL TECH • ROBOTICS",
            "LIVE",
            "Chennai / Online",
            True,
            "₹5,00,000",
            "Quantum Build 2026 is the premier 48-hour hardware and AI engineering hackathon.",
        )
        await _hackathon(
            session,
            cyberforge,
            "cyberforge-summit",
            "CYBERFORGE SUMMIT 2026",
            "ZERO TRUST • CRYPTO • THREAT INTEL",
            "UPCOMING",
            "Bengaluru / Hybrid",
            False,
            "$25,000",
            "Offensive and defensive cybersecurity hacking competition.",
        )
        await _hackathon(
            session,
            org,
            "neural-matrix-2026",
            "NEURAL MATRIX",
            "AUTONOMOUS AGENTS • RAG ENGINES",
            "JUDGING",
            "Online",
            True,
            "$50,000",
            "Global benchmark competition for autonomous multi-agent systems.",
        )
        await session.flush()

        tracks = [
            ("01 AI Infrastructure", "High-throughput LLM runtime optimization.", "₹2,00,000"),
            ("02 Computer Vision", "Edge video analytics and spatial computing.", "₹1,50,000"),
            ("03 Robotics & Civil Tech", "Autonomous drone pathfinding and urban sensors.", "₹1,50,000"),
        ]
        for name, description, prize in tracks:
            track_result = await session.execute(select(Track).where(Track.hackathon_id == hack.id, Track.name == name))
            if track_result.scalar_one_or_none() is None:
                session.add(Track(hackathon_id=hack.id, name=name, description=description, prize=prize))
        await session.flush()

        teams = [
            ("neural-forge", "Neural Forge", "01 AI Infrastructure", "ACTIVE", "HIGH", 94.2, 1, "+2.1", users[0:4]),
            ("codex-labs", "CodeX", "01 AI Infrastructure", "ACTIVE", "HIGH", 91.8, 2, "+0.8", users[4:7]),
            ("cyberforge", "CyberForge", "02 Computer Vision", "ACTIVE", "HIGH", 87.4, 3, "—", users[7:11]),
            (
                "byte-builders",
                "ByteBuilders",
                "03 Robotics & Civil Tech",
                "SUBMITTED",
                "MEDIUM",
                84.7,
                4,
                "-1.4",
                users[11:13],
            ),
            (
                "null-pointer",
                "Null Pointer",
                "03 Robotics & Civil Tech",
                "AT_RISK",
                "LOW",
                81.3,
                5,
                "+3.2",
                users[13:15],
            ),
        ]
        team_objects: dict[str, Team] = {}
        for slug, name, track, status, level, score, rank, trend, _members in teams:
            team_result = await session.execute(select(Team).where(Team.slug == slug))
            team: Team | None = team_result.scalar_one_or_none()
            if team is None:
                team = Team(
                    slug=slug,
                    name=name,
                    hackathon_id=hack.id,
                    track=track,
                    status=status,
                    activity_level=level,
                    score=score,
                    rank=rank,
                    score_trend=trend,
                )
                session.add(team)
            team_objects[slug] = team
        await session.flush()

        member_specs = [
            ("neural-forge", "Sarah Chen", "AI Lead", 35),
            ("neural-forge", "Marcus Vance", "Systems Architect", 28),
            ("neural-forge", "Elena Rostova", "Frontend Lead", 22),
            ("neural-forge", "David Kim", "DevOps / Infra", 15),
            ("codex-labs", "Alex Rivera", "Full Stack", 40),
            ("codex-labs", "Priya Sharma", "ML Engineer", 35),
            ("codex-labs", "Kenji Sato", "Backend", 25),
            ("cyberforge", "Rahul Sharma", "AI / ML Lead", 34),
            ("cyberforge", "Arun Kumar", "Backend Engineer", 27),
            ("cyberforge", "Vishnu Vardhan", "Frontend Architect", 23),
            ("cyberforge", "Adithya Nair", "Security & QA", 16),
            ("byte-builders", "Rohan Gupta", "Robotics Eng", 50),
            ("byte-builders", "Sneha Patel", "Embedded Systems", 50),
            ("null-pointer", "Vikram Seth", "Full Stack", 70),
            ("null-pointer", "Tanya Roy", "Designer", 30),
        ]
        name_to_user = {u.name: u for u in [admin, *users]}
        for slug, member_name, role, contribution in member_specs:
            team = team_objects[slug]
            member_user = name_to_user[member_name]
            member_result = await session.execute(
                select(TeamMember).where(TeamMember.team_id == team.id, TeamMember.user_id == member_user.id)
            )
            if member_result.scalar_one_or_none() is None:
                session.add(
                    TeamMember(
                        team_id=team.id,
                        user_id=member_user.id,
                        role=role,
                        contribution_percentage=contribution,
                    )
                )
        await session.flush()

        projects = [
            (
                "neural-forge",
                "OmniInference Engine",
                "Sub-millisecond distributed LLM streaming engine with speculative token execution.",
                "https://github.com/neuralforge/omni-inference",
                "https://omni-inference-demo.zapsters.dev",
                ["Rust", "CUDA", "PyTorch", "Next.js", "gRPC", "WebRTC"],
                184,
                42,
                26,
                89,
                14,
            ),
            (
                "codex-labs",
                "GridLens AI",
                "Autonomous power grid telemetry analysis with anomaly forecasting.",
                "https://github.com/codex-labs/gridlens",
                "https://gridlens.zapsters.dev",
                ["Python", "FastAPI", "Apache Kafka", "React", "TimescaleDB"],
                156,
                34,
                19,
                72,
                12,
            ),
            (
                "cyberforge",
                "Sentinel Vision",
                "AI-powered zero-trust industrial threat detection and vision safety platform.",
                "https://github.com/cyberforge/sentinel",
                "https://sentinel-cyberforge.zapsters.dev",
                ["Python", "YOLOv9", "FastAPI", "React", "OpenCV", "TensorRT", "TailwindCSS"],
                142,
                31,
                18,
                67,
                9,
            ),
            (
                "byte-builders",
                "AeroPath Drone Fleet",
                "Autonomous drone pathfinding for post-disaster flood mapping.",
                "https://github.com/bytebuilders/aeropath",
                "https://aeropath.zapsters.dev",
                ["C++", "ROS2", "Python", "Mapbox", "React"],
                98,
                19,
                14,
                45,
                8,
            ),
            (
                "null-pointer",
                "CivicPulse",
                "Crowdsourced urban infrastructure repair routing engine.",
                "https://github.com/nullpointer/civicpulse",
                "",
                ["TypeScript", "Next.js", "PostgreSQL"],
                44,
                8,
                5,
                20,
                4,
            ),
        ]
        for slug, name, tagline, repo, demo, stack, commits, prs, issues, tasks, days in projects:
            team = team_objects[slug]
            project_result = await session.execute(select(Project).where(Project.team_id == team.id))
            if project_result.scalar_one_or_none() is None:
                session.add(
                    Project(
                        team_id=team.id,
                        name=name,
                        tagline=tagline,
                        repo_url=repo,
                        demo_url=demo,
                        tech_stack=stack,
                        commits_count=commits,
                        prs_count=prs,
                        issues_count=issues,
                        tasks_count=tasks,
                        active_days=days,
                    )
                )
        await session.flush()

        task_specs = [
            ("neural-forge", "Implement custom CUDA kernel for INT4 quantization", "Sarah Chen", "DONE"),
            ("neural-forge", "Setup WebRTC audio stream bridge", "Elena Rostova", "DONE"),
            ("neural-forge", "P2P node discovery protocol", "Marcus Vance", "IN_PROGRESS"),
            ("cyberforge", "Integrate OpenCV camera stream buffer", "Rahul Sharma", "DONE"),
            ("cyberforge", "Audit model payload authorization middleware", "Adithya Nair", "IN_PROGRESS"),
        ]
        for slug, title, assignee_name, status in task_specs:
            team = team_objects[slug]
            assignee = name_to_user[assignee_name]
            task_result = await session.execute(
                select(TeamTask).where(TeamTask.team_id == team.id, TeamTask.title == title)
            )
            if task_result.scalar_one_or_none() is None:
                session.add(
                    TeamTask(
                        team_id=team.id,
                        title=title,
                        assignee_id=assignee.id,
                        status=status,
                    )
                )
        await session.flush()

        activity_specs = [
            ("neural-forge", "Sarah Chen", "opened PR #54", "Optimize INT8 matrix multiplication kernel", "pr"),
            ("neural-forge", "Marcus Vance", "closed issue #31", "Fix gRPC payload buffer alignment", "issue"),
            ("cyberforge", "Rahul Sharma", "opened PR #42", "Optimize spatial bounding box calculations", "pr"),
            ("cyberforge", "Adithya Nair", "completed TASK-28", "JWT auth verification on stream route", "task"),
        ]
        for slug, author, action, detail, item_type in activity_specs:
            team = team_objects[slug]
            activity_result = await session.execute(
                select(ActivityItem).where(
                    ActivityItem.team_id == team.id, ActivityItem.action == action, ActivityItem.author == author
                )
            )
            if activity_result.scalar_one_or_none() is None:
                session.add(ActivityItem(team_id=team.id, author=author, action=action, detail=detail, type=item_type))
        await session.flush()

        submission_specs = [
            ("neural-forge", "01 AI Infrastructure", "OmniInference Engine", "EVALUATED", 4, 94.2),
            ("codex-labs", "01 AI Infrastructure", "GridLens AI", "EVALUATED", 3, 91.8),
            ("cyberforge", "02 Computer Vision", "Sentinel Vision", "UNDER_REVIEW", 2, 87.4),
            ("byte-builders", "03 Robotics & Civil Tech", "AeroPath Drone Fleet", "SUBMITTED", 1, 84.7),
        ]
        for slug, track_name, project_name, status, eval_count, avg in submission_specs:
            team = team_objects[slug]
            submission_result = await session.execute(
                select(Submission).where(Submission.team_id == team.id, Submission.project_name == project_name)
            )
            if submission_result.scalar_one_or_none() is None:
                session.add(
                    Submission(
                        team_id=team.id,
                        hackathon_id=hack.id,
                        track=track_name,
                        project_name=project_name,
                        status=status,
                        evaluation_count=eval_count,
                        average_score=avg,
                        tech_stack=[],
                    )
                )
        await session.flush()

        judge_specs = [
            ("Dr. Aris Thorne", "aris.thorne@nvidia.com", "NVIDIA AI Research", "Principal CUDA Architect", 18, 12, 6),
            ("Maya Lin", "maya@vercel.com", "Vercel Engineering", "Head of Infrastructure", 15, 15, 0),
            ("Vikramaditya Roy", "roy@quantum.org", "Zapsters Labs", "VP of Robotics", 16, 8, 8),
        ]
        judge_objects: dict[str, Judge] = {}
        for name, email, org_name, role, assigned, completed, remaining in judge_specs:
            judge_result = await session.execute(select(Judge).where(Judge.email == email))
            judge: Judge | None = judge_result.scalar_one_or_none()
            if judge is None:
                judge = Judge(
                    hackathon_id=hack.id,
                    name=name,
                    email=email,
                    organization=org_name,
                    role=role,
                    assigned_teams_count=assigned,
                    completed_count=completed,
                    remaining_count=remaining,
                )
                session.add(judge)
            judge_objects[name] = judge
        await session.flush()

        evaluation_result = await session.execute(
            select(Evaluation).where(Evaluation.judge_id == judge_objects["Dr. Aris Thorne"].id)
        )
        if evaluation_result.scalar_one_or_none() is None:
            session.add(
                Evaluation(
                    judge_id=judge_objects["Dr. Aris Thorne"].id,
                    team_id=team_objects["cyberforge"].id,
                    hackathon_id=hack.id,
                    scores={"innovation": 27, "technical": 26, "impact": 17, "ux": 9, "presentation": 9},
                    total_score=88.0,
                    notes="Exceptional computer vision implementation using YOLOv9 custom TensorRT quantization.",
                    status="SAVED",
                )
            )
        await session.flush()

        registration_result = await session.execute(
            select(Registration).where(Registration.user_id == admin.id, Registration.hackathon_id == hack.id)
        )
        if registration_result.scalar_one_or_none() is None:
            session.add(
                Registration(
                    user_id=admin.id,
                    hackathon_id=hack.id,
                    team_name="CyberForge",
                    track="02 Computer Vision",
                    team_size=4,
                    status="CONFIRMED",
                    payment_status="NONE",
                )
            )
        await session.commit()


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed()
    await engine.dispose()
    logger.info("seed.complete")


if __name__ == "__main__":
    asyncio.run(main())
