# Zapsters Hackathon Platform — Analysis & Roadmap

> Generated 13 Aug 2026. Backend build follows `SOPs/fastapi-backend-sop (1).md` v3.0.0.
> Frontend work follows `SOPs/E2-frontend-SOP.md` and preserves all existing UI designs.

## 1. Current State

**What exists:** A polished, design-consistent UI prototype (Next.js 16 App Router,
React 19, Tailwind v4, recharts) with 55 pages across three personas — Participant,
Organizer, Judge. Strong design system (Geist/Inter, maroon `#800000`, rounded-3xl
cards, dark mode, mobile nav).

**The core gap:** The entire platform runs on in-memory mock data
(`src/lib/mockData.ts` + `mockApi.ts`). There is **no backend** — no database, no API
routes, no real auth, no payments, no GitHub integration, no real-time anything.
Every form "submits" to `useState`, every "live" indicator is cosmetic, and everything
resets on refresh.

## 2. Decided Architecture

```
hackerton_platform/
├── backend/                      # FastAPI per SOP (Python 3.12+, uv, Postgres, Redis, Alembic)
│   ├── app/
│   │   ├── api/v1/routes/        # users, auth, hackathons, teams, submissions,
│   │   │                         #   judges, evaluations, registrations, organizations,
│   │   │                         #   announcements, notifications, files, leaderboard
│   │   ├── core/                 # config, constants, exceptions, logging, security
│   │   ├── db/                   # base + async session
│   │   ├── models/               # SQLAlchemy 2.0 async ORM (singular tables)
│   │   ├── schemas/              # Create/Read/Update per resource
│   │   ├── services/             # business logic
│   │   ├── repositories/         # queries
│   │   ├── middleware/           # structlog request/response
│   │   └── main.py               # app factory + lifespan
│   ├── tests/{unit,integration,security}
│   ├── alembic/
│   ├── pyproject.toml · uv.lock · .env.example · .pre-commit-config.yaml
│   └── docker-compose.yml        # postgres + redis
└── src/                          # Next.js frontend — UI untouched
    ├── lib/api/                  # real API client (fetch → /api/v1) replacing mockApi
    └── lib/auth/                 # session store; existing components keep visuals
```

**Bridge (no UI change):** Next.js `rewrites` proxy `/api/*` → FastAPI in dev;
production points at the deployed backend. `mockApi.ts` becomes the seed dataset for
Postgres. `mockApi` function signatures are preserved so pages change by ~1 import each.

## 3. Locked Decisions

| Topic | Decision |
|---|---|
| Local Postgres + Redis | **Docker Desktop** + SOP `docker-compose.yml` |
| Payments | **Razorpay** (Phase 3) — CARD/UPI/NETBANKING, India-first, matches ₹ fee UI |
| Backend stack | FastAPI 0.115+ · Python ≥3.12 · uv · PostgreSQL · Redis · Alembic (SOP v3.0.0) |
| Auth | Argon2id (`pwdlib`) · JWT access ≤15 min · refresh in httpOnly secure cookie · Redis denylist (SOP §7) |
| Frontend | Next.js 16.2.6+ patched · existing UI designs strictly unchanged |
| Email/Analytics/Realtime | Resolved during Phase 3 (Resend, Plausible+PostHog per frontend SOP) |

## 4. Gap Analysis Summary

### Foundation blockers (Phase 0-1)
- No backend/database/API routes; 41/55 routes client-rendered
- No real auth — `localStorage['zapsters_auth']='true'`, any credentials work
- No persistence — tasks, bio, submissions, evaluations vanish on refresh
- Fake payments collect real card data (PCI risk) — replace with Razorpay
- No SEO (no `generateMetadata`, sitemap, robots, OG, JSON-LD), no 404/loading/error UX

### Participant gaps (Phase 2)
- Team creation/join/invite (buttons are dead), team matching directory
- Notifications center, team chat, mentor help
- Real GitHub integration (activity/telemetry/README are hardcoded)
- Live leaderboard + real countdowns; certificates; prizes/payouts tracking

### Organizer gaps (Phase 2-3)
- Create-hackathon wizard + lifecycle state machine (draft→open→live→judging→completed)
- Multi-hackathon switching (everything hardcodes `quantum-build-2026`)
- Wired rubric settings (weights currently unconnected; Presentation criterion missing)
- Auto-scoring standings (leaderboard uses static `score`, not evaluation aggregates)
- Bulk participant actions (message/change-status/export CSV are no-ops), announcements
- CSV import/export, sponsor management, check-ins, anti-cheat, certificate generation

### Judge gaps (Phase 2)
- Real judge dashboard (currently redirects into organizer shell; judges see OrganizerSidebar)
- Per-judge assignment/workload; evaluation history; feedback flowing back to teams

### Public site / marketing gaps (Phase 4)
- Real search/filter/sort/pagination; social proof (testimonials, winners showcase)
- Live event status & countdowns; newsletter capture; blog/resources; pricing page
- Community layer (Discord, forums, team-finding); organization directory

## 5. Must-Fix Bugs

1. Dead registration modal on `/hackathons/[slug]` (never openable)
2. `/hackathons` REGISTER button shows fake modal instead of navigating to form
3. Inline `hack-004`/`hack-005` only exist in `/hackathons` — detail pages silently render Quantum Build 2026
4. Fake payment collecting card data (PCI risk)
5. Leaderboard rows `cursor-pointer` with no `onClick`
6. Fabricated Unsplash IDs on leaderboard (404s)
7. Footer placeholder links (`href="#"`) + invisible brand wordmark
8. Duplicate route trees: `team/[slug]` vs `teams/[slug]` vs `dashboard/teams/[slug]`; `judge/review` vs `judge/reviews`
9. Onboarding discards all input; role selection has no routing effect
10. Empty workspace tabs (Timeline/Tracks/Rules/Resources)
11. Dark-mode `!important` override cascade in `globals.css` (refactor to tokens)

## 6. Phased Roadmap

### Phase 0 — Backend bootstrap (SOP-compliant) ✅ completed
Scaffold `backend/` (SOP §1 layered tree), uv + pinned deps (SOP §2-3), `core/config.py`
(SOP §5), Postgres schema via Alembic for all entities (SOP §6), Argon2id + JWT auth
(SOP §7), OWASP authz (SOP §8), named rate limits (SOP §9), structlog (SOP §10), tests
(SOP §12), pre-commit (SOP §4), seed from `mockData.ts` (`backend/scripts/seed.py`).

### Phase 1 — Frontend wiring (zero visual change)
Real API client in `src/lib/api/` with `mockApi`-compatible signatures; auth wiring;
Next.js rewrites + proxy route protection; per-page `generateMetadata`; 404/loading/error UX.

### Phase 2 — Feature completion
Creation wizard + lifecycle; multi-hackathon switching; team create/join/invite;
persistent submissions + auto-scored standings; wired rubric settings; notifications +
announcements; live leaderboard + countdowns; real judge dashboard.

### Phase 3 — Integrations
GitHub OAuth + webhooks; Razorpay payments; email (verification/reset/digests);
file uploads (MIME/size validation); real analytics from actual data.

### Phase 4 — Differentiators
Team matching; mentor Q&A; Discord bot; anti-cheat/plagiarism checks; certificate
generation; prize payout engine; live public judging broadcast; social proof layer;
community/forums; organization directory.

### Phase 5 — Scale
WebSockets/SSE live judging; caching/revalidation; observability (Sentry + `/metrics`);
public API + webhooks; SSO/enterprise.

## 7. Enforcement

- Conventional Commits (SOP §14); branch naming `feature/|fix/|security/|chore/|docs/`
- Local check sequence before every PR (SOP §15): `ruff check`, `ruff format --check`,
  `mypy`, `bandit -r app/ -ll`, `pip-audit`, `alembic upgrade head`, full pytest + coverage ≥80
- Frontend: `npm run lint`, `npx tsc --noEmit`, `next build` clean
