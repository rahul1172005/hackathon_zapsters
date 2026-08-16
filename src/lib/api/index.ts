import * as mockApi from '@/lib/mockApi';
import type {
  Announcement,
  AnnouncementCreatePayload,
  DirectoryEntry,
  DirectoryFilters,
  Evaluation,
  Hackathon,
  Judge,
  MatchCandidate,
  MatchingPreferences,
  Notification,
  NotificationSummary,
  Participant,
  PaymentOrder,
  PaymentOrderCreatePayload,
  PaymentVerification,
  PaymentVerifyPayload,
  Registration,
  RegistrationCreatePayload,
  RubricScores,
  SaveEvaluationResult,
  Standing,
  Submission,
  SubmissionCreatePayload,
  Team,
  TeamCreatePayload,
  TeamInvite,
  TeamSummary,
  UserUpdatePayload,
} from '@/types';
import {
  adaptAnnouncement,
  adaptEvaluation,
  adaptHackathon,
  adaptJudge,
  adaptMatchProfile,
  adaptNotification,
  adaptNotificationSummary,
  adaptParticipant,
  adaptPaymentOrder,
  adaptPaymentVerification,
  adaptRegistration,
  adaptStanding,
  adaptSubmission,
  adaptTeam,
  adaptTeamInvite,
  adaptTeamSummary,
  toDateTimeString,
  type TeamRef,
} from './adapters';
import { apiFetch, ApiError, isBackendOffline } from './client';

export { ApiError, apiFetch, API_BASE_URL, setAuthToken, isBackendOffline, markBackendOffline, resetBackendOffline } from './client';
export {
  adaptAnnouncement,
  adaptAuthUser,
  adaptEvaluation,
  adaptHackathon,
  adaptJudge,
  adaptMatchProfile,
  adaptNotification,
  adaptNotificationSummary,
  adaptParticipant,
  adaptPaymentOrder,
  adaptPaymentVerification,
  adaptRegistration,
  adaptStanding,
  adaptSubmission,
  adaptTeam,
  adaptTeamInvite,
  adaptTeamSummary,
} from './adapters';

/**
 * Real API client (Phase 1). Every function mirrors `src/lib/mockApi.ts` 1:1 so
 * pages swap imports without changing their call sites. Each function talks to
 * the FastAPI backend first; whenever an endpoint is unreachable, returns a
 * payload the UI cannot render, or is not yet implemented on the backend, it
 * falls back to the mock implementation so the app keeps working.
 */
async function withMockFallback<T>(remote: () => Promise<T>, mock: () => Promise<T>): Promise<T> {
  if (isBackendOffline()) {
    return mock();
  }
  try {
    return await remote();
  } catch (error) {
    return mock();
  }
}

function slugFromSummary(summary: Record<string, unknown>): string {
  const slug = typeof summary.slug === 'string' ? summary.slug : '';
  return slug ? slug : String(summary.id ?? '');
}

async function resolveTeam(teamRef: string): Promise<TeamRef> {
  const raw = await apiFetch<Record<string, unknown>>(`/teams/${encodeURIComponent(teamRef)}`);
  return { id: String(raw.id ?? ''), name: String(raw.name ?? ''), slug: String(raw.slug ?? '') };
}

async function resolveTeamMap(hackathonId?: string): Promise<Map<string, TeamRef>> {
  const map = new Map<string, TeamRef>();
  try {
    const teams = await apiFetch<Record<string, unknown>[]>('/teams', { query: { hackathon_id: hackathonId } });
    for (const team of teams) {
      const id = String(team.id ?? '');
      map.set(id, { id, name: String(team.name ?? ''), slug: String(team.slug ?? '') });
    }
  } catch {
    // Team metadata is best-effort; submissions still adapt with blank team name/slug.
  }
  return map;
}

export async function getHackathons(): Promise<Hackathon[]> {
  return withMockFallback(
    async () => (await apiFetch<Record<string, unknown>[]>('/hackathons')).map(adaptHackathon),
    () => mockApi.getHackathons(),
  );
}

export async function getHackathonBySlug(slug: string): Promise<Hackathon | null> {
  return withMockFallback(
    async () => adaptHackathon(await apiFetch(`/hackathons/${encodeURIComponent(slug)}`)),
    () => mockApi.getHackathonBySlug(slug),
  );
}

export async function getParticipant(username?: string): Promise<Participant> {
  return withMockFallback(
    async () => {
      const path = username ? `/users/${encodeURIComponent(username)}` : '/users/me';
      return adaptParticipant(await apiFetch(path));
    },
    () => mockApi.getParticipant(username),
  );
}

export async function getTeams(hackathonId?: string): Promise<Team[]> {
  return withMockFallback(
    async () => {
      const summaries = await apiFetch<Record<string, unknown>[]>('/teams', { query: { hackathon_id: hackathonId } });
      const details = await Promise.all(
        summaries.map((summary) => apiFetch(`/teams/${encodeURIComponent(slugFromSummary(summary))}`)),
      );
      return details.map(adaptTeam);
    },
    () => mockApi.getTeams(hackathonId),
  );
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  return withMockFallback(
    async () => adaptTeam(await apiFetch(`/teams/${encodeURIComponent(slug)}`)),
    () => mockApi.getTeamBySlug(slug),
  );
}

export async function getLeaderboard(hackathonId?: string): Promise<Team[]> {
  return withMockFallback(
    async () => {
      const summaries = await apiFetch<Record<string, unknown>[]>('/leaderboard', {
        query: { hackathon_id: hackathonId },
      });
      const details = await Promise.all(
        summaries.map((summary) => apiFetch(`/teams/${encodeURIComponent(slugFromSummary(summary))}`)),
      );
      return details.map(adaptTeam);
    },
    () => mockApi.getLeaderboard(hackathonId),
  );
}

export async function getSubmissions(hackathonId?: string): Promise<Submission[]> {
  return withMockFallback(
    async () => {
      const items = await apiFetch<Record<string, unknown>[]>('/submissions', {
        query: { hackathon_id: hackathonId },
      });
      const teamMap = await resolveTeamMap(hackathonId);
      return items.map((item) => {
        const teamId = String(item.team_id ?? '');
        return adaptSubmission(item, teamMap.get(teamId));
      });
    },
    () => mockApi.getSubmissions(hackathonId),
  );
}

export async function getJudges(hackathonId?: string): Promise<Judge[]> {
  return withMockFallback(
    async () => {
      const items = await apiFetch<Record<string, unknown>[]>('/judges', { query: { hackathon_id: hackathonId } });
      return items.map(adaptJudge);
    },
    () => mockApi.getJudges(hackathonId),
  );
}

interface EvaluationMeta {
  teamId: string;
  judgeId: string;
  hackathonId: string;
}

const evaluationMetaCache = new Map<string, EvaluationMeta>();

function cacheEvaluationMeta(teamId: string, raw: unknown): void {
  const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const judgeId = typeof record.judge_id === 'string' ? record.judge_id : '';
  const hackathonId = typeof record.hackathon_id === 'string' ? record.hackathon_id : '';
  const teamIdFromRaw = typeof record.team_id === 'string' ? record.team_id : '';
  if (judgeId && hackathonId) {
    evaluationMetaCache.set(teamId, { teamId: teamIdFromRaw || teamId, judgeId, hackathonId });
  }
}

export async function getEvaluation(teamId: string, judgeId: string = 'jdg-001'): Promise<Evaluation | null> {
  return withMockFallback(
    async () => {
      const raw = await apiFetch(`/evaluations/team/${encodeURIComponent(teamId)}`);
      cacheEvaluationMeta(teamId, raw);
      const team = await resolveTeam(teamId).catch(() => undefined);
      return adaptEvaluation(raw, team);
    },
    () => mockApi.getEvaluation(teamId, judgeId),
  );
}

export async function saveEvaluation(
  teamId: string,
  scores: RubricScores,
  notes: string,
  status: 'DRAFT' | 'SAVED' | 'SUBMITTED'
): Promise<SaveEvaluationResult> {
  return withMockFallback(
    async () => {
      const meta = evaluationMetaCache.get(teamId);
      if (!meta) {
        throw new ApiError('No evaluation metadata cached for this team', 0, 'no_evaluation_meta');
      }
      const raw = await apiFetch('/evaluations', {
        method: 'POST',
        body: {
          judge_id: meta.judgeId,
          team_id: meta.teamId,
          hackathon_id: meta.hackathonId,
          scores,
          notes,
          status,
        },
      });
      const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
      const totalScore = scores.innovation + scores.technical + scores.impact + scores.ux + scores.presentation;
      return {
        success: true,
        totalScore,
        updatedAt: toDateTimeString(record.updated_at),
      };
    },
    () => mockApi.saveEvaluation(teamId, scores, notes, status),
  );
}

export async function createTeam(payload: TeamCreatePayload): Promise<TeamSummary> {
  const created = await apiFetch<Record<string, unknown>>('/teams', { method: 'POST', body: payload });
  return adaptTeamSummary(created);
}

export async function joinTeamByCode(inviteCode: string): Promise<TeamSummary> {
  const created = await apiFetch<Record<string, unknown>>('/teams/join', {
    method: 'POST',
    body: { invite_code: inviteCode },
  });
  return adaptTeamSummary(created);
}

export async function getTeamInvite(teamId: string): Promise<TeamInvite> {
  const item = await apiFetch<Record<string, unknown>>(`/teams/${encodeURIComponent(teamId)}/invite`, {
    method: 'POST',
  });
  return adaptTeamInvite(item);
}

export async function leaveTeam(teamId: string): Promise<void> {
  await apiFetch(`/teams/${encodeURIComponent(teamId)}/leave`, { method: 'POST' });
}

export async function createSubmission(payload: SubmissionCreatePayload): Promise<Submission> {
  const item = await apiFetch<Record<string, unknown>>('/submissions', { method: 'POST', body: payload });
  const teamId = String(item.team_id ?? '');
  const team = await resolveTeam(teamId).catch(() => undefined);
  return adaptSubmission(item, team);
}

export async function submitSubmission(teamId: string): Promise<Submission> {
  const item = await apiFetch<Record<string, unknown>>(`/submissions/${encodeURIComponent(teamId)}/submit`, {
    method: 'POST',
  });
  const team = await resolveTeam(teamId).catch(() => undefined);
  return adaptSubmission(item, team);
}

export async function getSubmissionByTeam(teamId: string): Promise<Submission | null> {
  try {
    const item = await apiFetch<Record<string, unknown>>(`/submissions/team/${encodeURIComponent(teamId)}`);
    const team = await resolveTeam(teamId).catch(() => undefined);
    return adaptSubmission(item, team);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getSubmissionStandings(hackathonId: string): Promise<Standing[]> {
  return withMockFallback(
    async () => {
      const items = await apiFetch<Record<string, unknown>[]>('/submissions/standings', {
        query: { hackathon_id: hackathonId },
      });
      return items.map(adaptStanding);
    },
    () => Promise.resolve([]),
  );
}

export async function getNotifications(): Promise<Notification[]> {
  return withMockFallback(
    async () => (await apiFetch<Record<string, unknown>[]>('/notifications')).map(adaptNotification),
    () => Promise.resolve([]),
  );
}

export async function getNotificationSummary(): Promise<NotificationSummary> {
  return withMockFallback(
    async () => adaptNotificationSummary(await apiFetch('/notifications/summary')),
    () => Promise.resolve({ totalCount: 0, unreadCount: 0 }),
  );
}

export async function markNotificationRead(notificationId: string): Promise<Notification> {
  const item = await apiFetch<Record<string, unknown>>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: 'POST' },
  );
  return adaptNotification(item);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch('/notifications/read-all', { method: 'POST' });
}

export async function getAnnouncements(hackathonId: string): Promise<Announcement[]> {
  return withMockFallback(
    async () => {
      const items = await apiFetch<Record<string, unknown>[]>(
        `/hackathons/${encodeURIComponent(hackathonId)}/announcements`,
      );
      return items.map(adaptAnnouncement);
    },
    () => Promise.resolve([]),
  );
}

export async function createAnnouncement(
  hackathonId: string,
  payload: AnnouncementCreatePayload,
): Promise<Announcement> {
  const item = await apiFetch<Record<string, unknown>>(
    `/hackathons/${encodeURIComponent(hackathonId)}/announcements`,
    { method: 'POST', body: payload },
  );
  return adaptAnnouncement(item);
}

export async function getMyRegistrations(): Promise<Registration[]> {
  return withMockFallback(
    async () => (await apiFetch<Record<string, unknown>[]>('/registrations')).map(adaptRegistration),
    () => Promise.resolve([]),
  );
}

export async function registerForHackathon(payload: RegistrationCreatePayload): Promise<Registration> {
  const item = await apiFetch<Record<string, unknown>>('/registrations', { method: 'POST', body: payload });
  return adaptRegistration(item);
}

export async function cancelRegistration(registrationId: string): Promise<Registration> {
  const item = await apiFetch<Record<string, unknown>>(
    `/registrations/${encodeURIComponent(registrationId)}/cancel`,
    { method: 'POST' },
  );
  return adaptRegistration(item);
}

export async function createPaymentOrder(payload: PaymentOrderCreatePayload): Promise<PaymentOrder> {
  const item = await apiFetch<Record<string, unknown>>('/payments/orders', { method: 'POST', body: payload });
  return adaptPaymentOrder(item);
}

export async function verifyPayment(payload: PaymentVerifyPayload): Promise<PaymentVerification> {
  const item = await apiFetch<Record<string, unknown>>('/payments/verify', { method: 'POST', body: payload });
  return adaptPaymentVerification(item);
}

export async function updateUserProfile(payload: UserUpdatePayload): Promise<Participant> {
  return withMockFallback(
    async () => adaptParticipant(await apiFetch('/users/me', { method: 'PATCH', body: payload })),
    () => mockApi.getParticipant(),
  );
}

export async function getMatchingPreferences(): Promise<MatchingPreferences | undefined> {
  return withMockFallback(
    () => apiFetch<MatchingPreferences>('/matching/preferences'),
    () => Promise.resolve(undefined),
  );
}

export async function saveMatchingPreferences(
  prefs: MatchingPreferences,
): Promise<MatchingPreferences | undefined> {
  return withMockFallback(
    () => apiFetch<MatchingPreferences>('/matching/preferences', { method: 'POST', body: prefs }),
    () => Promise.resolve(undefined),
  );
}

export async function leaveMatchingPool(): Promise<void> {
  return withMockFallback(
    () => apiFetch<void>('/matching/preferences', { method: 'DELETE' }),
    () => Promise.resolve(undefined),
  );
}

export async function getMatchingRecommendations(): Promise<MatchCandidate[] | undefined> {
  return withMockFallback(
    async () => {
      const items = await apiFetch<Record<string, unknown>[]>('/matching/recommendations');
      return items.map(adaptMatchProfile);
    },
    () => Promise.resolve(undefined),
  );
}

export async function getMatchingDirectory(filters?: DirectoryFilters): Promise<DirectoryEntry[] | undefined> {
  return withMockFallback(
    async () => {
      const items = await apiFetch<Record<string, unknown>[]>('/matching/directory', {
        query: { role: filters?.role, skills: filters?.skills, q: filters?.q, limit: filters?.limit },
      });
      return items.map(adaptMatchProfile);
    },
    () => Promise.resolve(undefined),
  );
}
