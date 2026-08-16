import { getHackathonBySlug, getLeaderboard, getSubmissions } from '@/lib/api';
import type { Submission } from '@/types';

/**
 * Client for the live public judging broadcast.
 *
 * Attempts a real Server-Sent Events connection to the FastAPI backend
 * (`/api/v1/broadcast/{hackathonId}/live`, proxied by the Next.js rewrites).
 * When the endpoint is unreachable (backend not running / not deployed), it
 * transparently falls back to a simulated stream built from `mockApi`, so the
 * public page always has something to render.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';
const CONNECT_TIMEOUT_MS = 1200;
export const BROADCAST_POLL_INTERVAL_MS = 5000;

export interface LiveSubmission {
  id: string;
  teamId: string;
  teamName: string | null;
  teamSlug: string | null;
  track: string | null;
  projectName: string;
  tagline: string | null;
  status: string;
  evaluationCount: number;
  averageScore: number;
}

export interface LiveStanding {
  teamId: string;
  rank: number;
  name: string;
  slug: string;
  score: number;
  track: string | null;
  status: string;
}

export interface PublicCriterion {
  key: string;
  label: string;
  score: number | null;
  max: number;
}

export interface BroadcastHackathon {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  status: string;
  judgingRate?: number;
  submissionRate?: number;
  teamsCount?: number;
  participantsCount?: number;
  prizePool?: string | null;
  location?: string | null;
}

export interface ScoreBreakdown {
  criteria: Record<string, number>;
  count: number;
}

export interface JudgingEvent {
  type:
    | 'snapshot'
    | 'submission.presented'
    | 'score.revealed'
    | 'standings'
    | 'heartbeat'
    | 'ended';
  sequence?: number;
  at?: string;
  hackathon?: BroadcastHackathon;
  rubric?: Record<string, number>;
  submissions?: LiveSubmission[];
  standings?: LiveStanding[];
  scoreBreakdowns?: Record<string, ScoreBreakdown>;
  judgesCount?: number;
  submission?: LiveSubmission;
  criteria?: PublicCriterion[];
  total?: number;
  evaluationCount?: number;
  presentedAt?: string;
  revealedAt?: string;
  reason?: string;
}

export type BroadcastMode = 'live' | 'demo';

export const PUBLIC_CRITERIA_KEYS = ['innovation', 'technical', 'impact', 'ux', 'presentation'] as const;

const CRITERIA_LABELS: Record<string, string> = {
  innovation: 'Innovation',
  technical: 'Technical',
  impact: 'Impact',
  ux: 'UX',
  presentation: 'Presentation',
};

const DEFAULT_RUBRIC: Record<string, number> = {
  innovation: 30,
  technical: 30,
  impact: 20,
  ux: 10,
  presentation: 10,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeSubmission(raw: Record<string, unknown>): LiveSubmission {
  return {
    id: String(raw.id ?? raw.team_id ?? 'unknown'),
    teamId: String(raw.team_id ?? ''),
    teamName: raw.team_name ? String(raw.team_name) : null,
    teamSlug: raw.team_slug ? String(raw.team_slug) : null,
    track: raw.track ? String(raw.track) : null,
    projectName: String(raw.project_name ?? 'Untitled Project'),
    tagline: raw.tagline ? String(raw.tagline) : null,
    status: String(raw.status ?? 'SUBMITTED'),
    evaluationCount: Number(raw.evaluation_count ?? 0),
    averageScore: Number(raw.average_score ?? 0),
  };
}

function normalizeStandings(rows: unknown[]): LiveStanding[] {
  return rows.map((row) => {
    const entry = (row ?? {}) as Record<string, unknown>;
    return {
      teamId: String(entry.team_id ?? ''),
      rank: Number(entry.rank ?? 0),
      name: String(entry.name ?? 'Unknown Team'),
      slug: String(entry.slug ?? ''),
      score: Number(entry.score ?? 0),
      track: entry.track ? String(entry.track) : null,
      status: String(entry.status ?? 'ACTIVE'),
    };
  });
}

function normalizeCriteria(criteria: unknown[]): PublicCriterion[] {
  return criteria.map((item) => {
    const entry = (item ?? {}) as Record<string, unknown>;
    return {
      key: String(entry.key ?? ''),
      label: String(entry.label ?? entry.key ?? ''),
      score: typeof entry.score === 'number' ? entry.score : null,
      max: Number(entry.max ?? 0),
    };
  });
}

function normalizeScoreBreakdowns(raw: unknown): Record<string, ScoreBreakdown> {
  const source = (raw ?? {}) as Record<string, { criteria?: Record<string, unknown>; count?: unknown }>;
  const result: Record<string, ScoreBreakdown> = {};
  for (const [id, value] of Object.entries(source)) {
    const criteria: Record<string, number> = {};
    for (const [key, score] of Object.entries(value.criteria ?? {})) {
      criteria[key] = Number(score ?? 0);
    }
    result[id] = { criteria, count: Number(value.count ?? 0) };
  }
  return result;
}

function normalizeEvent(eventName: string, raw: Record<string, unknown>): JudgingEvent | null {
  const hackathon = (raw.hackathon ?? {}) as Record<string, unknown>;
  switch (eventName) {
    case 'snapshot':
      return {
        type: 'snapshot',
        at: raw.stream_started_at ? String(raw.stream_started_at) : undefined,
        hackathon: {
          id: hackathon.id ? String(hackathon.id) : '',
          slug: hackathon.slug ? String(hackathon.slug) : '',
          title: String(hackathon.title ?? 'Hackathon'),
          tagline: hackathon.tagline ? String(hackathon.tagline) : null,
          status: String(hackathon.status ?? 'LIVE'),
          judgingRate: hackathon.judging_rate ? Number(hackathon.judging_rate) : undefined,
          submissionRate: hackathon.submission_rate ? Number(hackathon.submission_rate) : undefined,
          teamsCount: hackathon.teams_count ? Number(hackathon.teams_count) : undefined,
          participantsCount: hackathon.participants_count ? Number(hackathon.participants_count) : undefined,
          prizePool: hackathon.prize_pool ? String(hackathon.prize_pool) : null,
          location: hackathon.location ? String(hackathon.location) : null,
        },
        rubric: (raw.rubric ?? {}) as Record<string, number>,
        submissions: Array.isArray(raw.submissions) ? raw.submissions.map(normalizeSubmission) : [],
        standings: Array.isArray(raw.standings) ? normalizeStandings(raw.standings) : [],
        scoreBreakdowns: normalizeScoreBreakdowns(raw.score_breakdowns),
        judgesCount: Number(raw.judges_count ?? 0),
      };
    case 'submission.presented':
      return {
        type: 'submission.presented',
        presentedAt: raw.presented_at ? String(raw.presented_at) : undefined,
        submission: normalizeSubmission((raw.submission ?? {}) as Record<string, unknown>),
      };
    case 'score.revealed':
      return {
        type: 'score.revealed',
        revealedAt: raw.revealed_at ? String(raw.revealed_at) : undefined,
        submission: normalizeSubmission((raw.submission ?? {}) as Record<string, unknown>),
        criteria: Array.isArray(raw.criteria) ? normalizeCriteria(raw.criteria) : [],
        total: raw.total ? Number(raw.total) : undefined,
        evaluationCount: raw.evaluation_count ? Number(raw.evaluation_count) : undefined,
      };
    case 'standings':
      return {
        type: 'standings',
        at: raw.updated_at ? String(raw.updated_at) : undefined,
        standings: Array.isArray(raw.standings) ? normalizeStandings(raw.standings) : [],
      };
    case 'heartbeat':
      return {
        type: 'heartbeat',
        at: raw.at ? String(raw.at) : undefined,
        sequence: raw.sequence ? Number(raw.sequence) : undefined,
      };
    case 'ended':
      return { type: 'ended', at: raw.at ? String(raw.at) : undefined, reason: raw.reason ? String(raw.reason) : undefined };
    default:
      return null;
  }
}

function parseSseEvent(chunk: string): JudgingEvent | null {
  let eventName = 'message';
  let data = '';
  for (const line of chunk.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data += (data ? '\n' : '') + line.slice(5).replace(/^ /, '');
    } else if (line.startsWith(':')) {
      continue;
    }
  }
  if (!data) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }
  return normalizeEvent(eventName, (parsed ?? {}) as Record<string, unknown>);
}

interface ConnectOptions {
  onConnected?: () => void;
}

async function connectEventStream(
  url: string,
  onEvent: (event: JudgingEvent) => void,
  signal: AbortSignal,
  options: ConnectOptions = {},
): Promise<void> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'text/event-stream' },
    cache: 'no-store',
  });
  if (!response.ok || !response.body) {
    throw new Error(`Live broadcast unavailable (${response.status})`);
  }
  options.onConnected?.();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const event = parseSseEvent(chunk);
        if (event) onEvent(event);
        boundary = buffer.indexOf('\n\n');
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Derive an approximate per-criterion breakdown from a single aggregate score. */
export function deriveCriteria(submission: LiveSubmission, rubric: Record<string, number>): PublicCriterion[] {
  const totalMax = Object.values(rubric).reduce((sum, max) => sum + max, 0);
  const fraction = totalMax > 0 ? Math.max(0, Math.min(1, submission.averageScore / totalMax)) : 0;
  return PUBLIC_CRITERIA_KEYS.map((key) => {
    const max = rubric[key] ?? 0;
    return {
      key,
      label: CRITERIA_LABELS[key] ?? key,
      score: max > 0 ? Math.round(fraction * max * 10) / 10 : null,
      max,
    };
  });
}

function toLiveSubmission(submission: Submission): LiveSubmission {
  return {
    id: submission.id,
    teamId: submission.teamId,
    teamName: submission.teamName,
    teamSlug: submission.teamSlug,
    track: submission.track,
    projectName: submission.projectName,
    tagline: submission.tagline,
    status: submission.status,
    evaluationCount: submission.evaluationCount,
    averageScore: submission.averageScore,
  };
}

async function runMockBroadcast(
  hackathonId: string,
  onEvent: (event: JudgingEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const [hackathon, mockSubmissions, mockTeams] = await Promise.all([
    getHackathonBySlug(hackathonId),
    getSubmissions(hackathonId),
    getLeaderboard(hackathonId),
  ]);

  const submissions = mockSubmissions.map(toLiveSubmission);
  const scores = new Map(submissions.map((s) => [s.teamId, s.averageScore]));
  const rubric = { ...DEFAULT_RUBRIC };
  let presentedIndex = 0;
  let tick = 0;

  const emit = (event: JudgingEvent) => {
    if (!signal.aborted) onEvent(event);
  };

  const buildStandings = (): LiveStanding[] => {
    return mockTeams
      .map((team, index) => ({
        teamId: team.id,
        rank: index + 1,
        name: team.name,
        slug: team.slug,
        score: scores.get(team.id) ?? team.score,
        track: team.track,
        status: team.status,
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  };

  emit({
    type: 'snapshot',
    at: new Date().toISOString(),
    hackathon: {
      id: hackathon?.id ?? hackathonId,
      slug: hackathon?.slug ?? hackathonId,
      title: hackathon?.title ?? 'Hackathon',
      tagline: hackathon?.tagline ?? null,
      status: hackathon?.status ?? 'JUDGING',
      judgingRate: hackathon?.judgingRate ?? 63,
      submissionRate: hackathon?.submissionRate ?? 87,
      teamsCount: hackathon?.teamsCount,
      participantsCount: hackathon?.participantsCount,
      prizePool: hackathon?.prizePool,
      location: hackathon?.location,
    },
    rubric,
    submissions: submissions.map((s) => ({ ...s })),
    standings: buildStandings(),
    judgesCount: 3,
  });

  const first = submissions[0];
  if (first) {
    emit({
      type: 'submission.presented',
      presentedAt: new Date().toISOString(),
      submission: { ...first },
    });
  }

  while (!signal.aborted) {
    await sleep(BROADCAST_POLL_INTERVAL_MS);
    if (signal.aborted) break;
    tick += 1;
    const presented = submissions.length > 0 ? submissions[presentedIndex % submissions.length] : undefined;

    if (tick % 2 === 0 && presented) {
      const base = scores.get(presented.teamId) ?? presented.averageScore;
      const next = Math.round(Math.min(100, base + 0.3 + Math.random() * 0.9) * 10) / 10;
      scores.set(presented.teamId, next);
      const revealed = { ...presented, averageScore: next };
      emit({
        type: 'score.revealed',
        revealedAt: new Date().toISOString(),
        submission: revealed,
        criteria: deriveCriteria(revealed, rubric),
        total: next,
        evaluationCount: revealed.evaluationCount,
      });
    }

    if (tick % 3 === 0 && submissions.length > 0) {
      presentedIndex += 1;
      const nextPresented = submissions[presentedIndex % submissions.length];
      emit({
        type: 'submission.presented',
        presentedAt: new Date().toISOString(),
        submission: { ...nextPresented },
      });
    }

    if (tick % 2 === 0) {
      emit({ type: 'standings', at: new Date().toISOString(), standings: buildStandings() });
    }

    if (tick % 4 === 0) {
      emit({ type: 'heartbeat', at: new Date().toISOString(), sequence: tick });
    }
  }
}

/**
 * Subscribe to the live judging broadcast for a hackathon.
 *
 * Prefers the real SSE endpoint; falls back to a simulated mockApi stream when
 * the endpoint cannot be reached. Returns an unsubscribe function.
 */
export function subscribeToJudgingBroadcast(
  hackathonId: string,
  onEvent: (event: JudgingEvent) => void,
  onModeChange?: (mode: BroadcastMode) => void,
): () => void {
  const liveController = new AbortController();
  const mockController = new AbortController();
  let connected = false;
  let usingMock = false;

  const url = `${API_BASE}/broadcast/${encodeURIComponent(hackathonId)}/live`;

  const connectTimer =
    typeof window !== 'undefined'
      ? window.setTimeout(() => {
          if (connected) return;
          usingMock = true;
          liveController.abort();
          onModeChange?.('demo');
          void runMockBroadcast(hackathonId, onEvent, mockController.signal);
        }, CONNECT_TIMEOUT_MS)
      : undefined;

  connectEventStream(url, onEvent, liveController.signal, {
    onConnected: () => {
      connected = true;
      if (connectTimer !== undefined) window.clearTimeout(connectTimer);
      onModeChange?.('live');
    },
  }).catch(() => {
    if (connected || usingMock || mockController.signal.aborted) return;
    usingMock = true;
    onModeChange?.('demo');
    void runMockBroadcast(hackathonId, onEvent, mockController.signal);
  });

  return () => {
    if (connectTimer !== undefined) window.clearTimeout(connectTimer);
    liveController.abort();
    mockController.abort();
  };
}
