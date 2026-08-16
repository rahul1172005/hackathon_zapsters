import type {
  ActivityLevel,
  Announcement,
  Evaluation,
  Hackathon,
  HackathonStatus,
  Judge,
  MatchProfile,
  Notification,
  NotificationSummary,
  Participant,
  PaymentOrder,
  PaymentVerification,
  Registration,
  RubricScores,
  Sponsor,
  Standing,
  Submission,
  SubmissionStatus,
  Team,
  TeamActivityItem,
  TeamInvite,
  TeamMember,
  TeamStatus,
  TeamSummary,
  TeamTask,
  TimelinePhase,
  Track,
} from '@/types';
import type { AuthUser } from '@/lib/auth/types';
import { ApiError } from './client';

/**
 * Adapters that translate FastAPI (snake_case) response payloads into the
 * camelCase shapes declared in src/types/index.ts. Adapters are strict about
 * fields the UI actually renders — a payload missing a required field throws an
 * {@link ApiError}, which lets callers fall back to the mock implementation.
 */

export interface TeamRef {
  id: string;
  name: string;
  slug: string;
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiError(`Malformed ${label} payload from API`, 422, 'malformed_payload');
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asArray<T>(value: unknown, map: (item: unknown) => T): T[] {
  return Array.isArray(value) ? value.map(map) : [];
}

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return asString(value);
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return asNumber(value);
}

export function toDateString(value: unknown): string {
  const raw = asString(value);
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function toDateTimeString(value: unknown): string {
  const raw = asString(value);
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function adaptHackathonStatus(value: unknown): HackathonStatus {
  const status = asString(value).toUpperCase();
  if (status === 'UPCOMING' || status === 'LIVE' || status === 'JUDGING' || status === 'COMPLETED') {
    return status;
  }
  if (status === 'OPEN' || status === 'DRAFT') return 'UPCOMING';
  if (status === 'CANCELLED') return 'COMPLETED';
  return 'UPCOMING';
}

function adaptTeamStatus(value: unknown): TeamStatus {
  const status = asString(value).toUpperCase();
  if (
    status === 'ACTIVE' ||
    status === 'IDLE' ||
    status === 'AT_RISK' ||
    status === 'SUBMITTED' ||
    status === 'JUDGING' ||
    status === 'DISQUALIFIED'
  ) {
    return status;
  }
  return 'IDLE';
}

function adaptActivityLevel(value: unknown): ActivityLevel {
  const level = asString(value).toUpperCase();
  if (level === 'HIGH' || level === 'MEDIUM' || level === 'LOW' || level === 'INACTIVE') return level;
  return 'INACTIVE';
}

function adaptSubmissionStatus(value: unknown): SubmissionStatus {
  const status = asString(value).toUpperCase();
  if (status === 'DRAFT' || status === 'SUBMITTED' || status === 'UNDER_REVIEW' || status === 'EVALUATED') {
    return status;
  }
  return 'DRAFT';
}

export function adaptTrack(value: unknown): Track {
  const record = requireRecord(value, 'track');
  const name = asString(record.name);
  if (!name) throw new ApiError('Track missing name', 422, 'malformed_payload');
  return { id: asString(record.id, name), name, description: asString(record.description), prize: asString(record.prize) };
}

export function adaptTimelinePhase(value: unknown): TimelinePhase {
  const record = requireRecord(value, 'timeline phase');
  const name = asString(record.name);
  if (!name) throw new ApiError('Timeline phase missing name', 422, 'malformed_payload');
  const raw = asString(record.status, 'UPCOMING').toUpperCase();
  const status: TimelinePhase['status'] = raw === 'COMPLETED' || raw === 'IN_PROGRESS' ? raw : 'UPCOMING';
  return { id: asString(record.id, name), name, date: asString(record.date), status };
}

export function adaptSponsor(value: unknown): Sponsor {
  const record = requireRecord(value, 'sponsor');
  const name = asString(record.name);
  if (!name) throw new ApiError('Sponsor missing name', 422, 'malformed_payload');
  const raw = asString(record.tier, 'Gold');
  const tier: Sponsor['tier'] = raw === 'Title' || raw === 'Platinum' || raw === 'Track' ? raw : 'Gold';
  return { id: asString(record.id, name), name, tier, logo: asString(record.logo) };
}

export function adaptPrize(value: unknown): { title: string; amount: string; description: string } {
  const record = requireRecord(value, 'prize');
  const title = asString(record.title);
  if (!title) throw new ApiError('Prize missing title', 422, 'malformed_payload');
  return { title, amount: asString(record.amount), description: asString(record.description) };
}

export function adaptHackathon(value: unknown): Hackathon {
  const record = requireRecord(value, 'hackathon');
  const slug = asString(record.slug);
  if (!slug) throw new ApiError('Hackathon missing slug', 422, 'malformed_payload');
  return {
    id: asString(record.id, slug),
    slug,
    title: asString(record.title),
    tagline: asString(record.tagline),
    organization: asString(record.organization ?? record.organization_name),
    status: adaptHackathonStatus(record.status),
    startDate: toDateString(record.start_date) || asString(record.start_date),
    endDate: toDateString(record.end_date) || asString(record.end_date),
    durationHours: asNumber(record.duration_hours),
    location: asString(record.location, 'Online'),
    isOnline: asBoolean(record.is_online, true),
    prizePool: asString(record.prize_pool),
    participantsCount: asNumber(record.participants_count),
    teamsCount: asNumber(record.teams_count),
    submissionRate: asNumber(record.submission_rate),
    judgingRate: asNumber(record.judging_rate),
    activeTeamsCount: asNumber(record.active_teams_count),
    tracks: asArray(record.tracks, adaptTrack),
    timeline: asArray(record.timeline, adaptTimelinePhase),
    prizes: asArray(record.prizes, adaptPrize),
    rules: asArray(record.rules, (item) => asString(item)),
    sponsors: asArray(record.sponsors, adaptSponsor),
    faqs: asArray(record.faqs, (item) => {
      const faq = requireRecord(item, 'faq');
      return { question: asString(faq.question), answer: asString(faq.answer) };
    }),
    description: asString(record.description),
  };
}

export function adaptTeamMember(value: unknown, index = 0): TeamMember {
  const record = requireRecord(value, 'team member');
  return {
    id: asString(record.id, `member-${index}`),
    name: asString(record.name, `Member ${index + 1}`),
    username: asString(record.username),
    avatar: asString(record.avatar),
    role: asString(record.role),
    contributionPercentage: asNumber(record.contribution_percentage ?? record.contributionPercentage),
  };
}

export function adaptTeamTask(value: unknown): TeamTask {
  const record = requireRecord(value, 'team task');
  const raw = asString(record.status, 'TODO').toUpperCase();
  const status: TeamTask['status'] = raw === 'IN_PROGRESS' || raw === 'DONE' ? raw : 'TODO';
  return { id: asString(record.id), title: asString(record.title), assignee: asString(record.assignee), status };
}

export function adaptTeamActivity(value: unknown): TeamActivityItem {
  const record = requireRecord(value, 'activity item');
  const raw = asString(record.type, 'task').toLowerCase();
  const type: TeamActivityItem['type'] =
    raw === 'pr' || raw === 'commit' || raw === 'issue' || raw === 'task' || raw === 'merge' ? raw : 'task';
  return {
    id: asString(record.id),
    timestamp: toDateTimeString(record.timestamp) || asString(record.timestamp),
    author: asString(record.author),
    action: asString(record.action),
    detail: asString(record.detail),
    type,
  };
}

export function adaptTeamProject(value: unknown) {
  const record = requireRecord(value, 'project');
  return {
    id: asString(record.id),
    name: asString(record.name),
    tagline: asString(record.tagline),
    description: asString(record.description),
    repoUrl: asString(record.repo_url),
    demoUrl: asString(record.demo_url),
    presentationUrl: asString(record.presentation_url),
    techStack: asArray(record.tech_stack, (item) => asString(item)),
    screenshots: asArray(record.screenshots, (item) => asString(item)),
    commitsCount: asNumber(record.commits_count),
    prsCount: asNumber(record.prs_count),
    issuesCount: asNumber(record.issues_count),
    tasksCount: asNumber(record.tasks_count),
    activeDays: asNumber(record.active_days),
  };
}

export function adaptTeam(value: unknown): Team {
  const record = requireRecord(value, 'team');
  const slug = asString(record.slug);
  const name = asString(record.name);
  if (!slug || !name) throw new ApiError('Team missing slug or name', 422, 'malformed_payload');

  const members = asArray(record.members, adaptTeamMember);
  const project = record.project;
  if (!project) throw new ApiError(`Team "${name}" missing project payload`, 422, 'malformed_payload');

  return {
    id: asString(record.id, slug),
    slug,
    name,
    rank: asNumber(record.rank),
    score: asNumber(record.score),
    hackathonId: asString(record.hackathon_id),
    hackathonTitle: asString(record.hackathon_title),
    track: asString(record.track),
    status: adaptTeamStatus(record.status),
    activityLevel: adaptActivityLevel(record.activity_level),
    scoreTrend: asString(record.score_trend),
    members,
    project: adaptTeamProject(project),
    tasks: asArray(record.tasks, adaptTeamTask),
    contributionSplit: members.map((member) => ({ name: member.name, percentage: member.contributionPercentage })),
    activityLog: asArray(record.activity_log ?? record.activityLog, adaptTeamActivity),
  };
}

export function adaptJudge(value: unknown): Judge {
  const record = requireRecord(value, 'judge');
  const name = asString(record.name);
  if (!name) throw new ApiError('Judge missing name', 422, 'malformed_payload');
  return {
    id: asString(record.id, name),
    name,
    email: asString(record.email),
    avatar: asString(record.avatar),
    organization: asString(record.organization),
    role: asString(record.role),
    assignedTeamsCount: asNumber(record.assigned_teams_count),
    completedCount: asNumber(record.completed_count),
    remainingCount: asNumber(record.remaining_count),
  };
}

export function adaptSubmission(value: unknown, team?: TeamRef): Submission {
  const record = requireRecord(value, 'submission');
  const projectName = asString(record.project_name);
  if (!projectName) throw new ApiError('Submission missing project_name', 422, 'malformed_payload');
  const teamId = asString(record.team_id);
  return {
    id: asString(record.id),
    teamId,
    teamName: team?.name ?? asString(record.team_name),
    teamSlug: team?.slug ?? asString(record.team_slug),
    hackathonId: asString(record.hackathon_id),
    track: asString(record.track),
    projectName,
    tagline: asString(record.tagline),
    description: asString(record.description),
    repoUrl: asString(record.repo_url),
    demoUrl: asString(record.demo_url),
    presentationUrl: asString(record.presentation_url),
    techStack: asArray(record.tech_stack, (item) => asString(item)),
    submittedAt: toDateTimeString(record.submitted_at),
    status: adaptSubmissionStatus(record.status),
    evaluationCount: asNumber(record.evaluation_count),
    averageScore: asNumber(record.average_score),
  };
}

export function adaptEvaluation(value: unknown, team?: TeamRef): Evaluation {
  const record = requireRecord(value, 'evaluation');
  const rawStatus = asString(record.status).toUpperCase();
  const status: Evaluation['status'] = rawStatus === 'SAVED' || rawStatus === 'SUBMITTED' ? rawStatus : 'DRAFT';
  return {
    id: asString(record.id),
    judgeId: asString(record.judge_id),
    judgeName: asString(record.judge_name),
    teamId: asString(record.team_id),
    teamName: team?.name ?? asString(record.team_name),
    hackathonId: asString(record.hackathon_id),
    scores: adaptRubricScores(record.scores),
    totalScore: asNumber(record.total_score),
    notes: asString(record.notes),
    status,
    updatedAt: toDateTimeString(record.updated_at),
  };
}

function adaptRubricScores(value: unknown): RubricScores {
  const record = requireRecord(value, 'rubric scores');
  return {
    innovation: asNumber(record.innovation),
    technical: asNumber(record.technical),
    impact: asNumber(record.impact),
    ux: asNumber(record.ux),
    presentation: asNumber(record.presentation),
  };
}

export function adaptParticipant(value: unknown): Participant {
  const record = requireRecord(value, 'user');
  const username = asString(record.username);
  if (!username) throw new ApiError('User missing username', 422, 'malformed_payload');
  return {
    id: asString(record.id, username),
    username,
    name: asString(record.name),
    title: asString(record.title),
    avatar: asString(record.avatar),
    bio: asString(record.bio),
    roles: asArray(record.roles, (item) => asString(item)),
    skills: asArray(record.skills, (item) => asString(item)),
    githubHandle: asString(record.github_handle),
    linkedinUrl: asString(record.linkedin_url),
    stats: {
      hackathonsCount: asNumber(record.hackathons_count),
      wins: asNumber(record.wins),
      finals: asNumber(record.finals),
      projectsCount: asNumber(record.projects_count),
    },
    projects: [],
    competitionHistory: [],
  };
}

export function adaptAuthUser(value: unknown): AuthUser {
  const record = requireRecord(value, 'user');
  const username = asString(record.username);
  if (!username) throw new ApiError('User missing username', 422, 'malformed_payload');
  return {
    id: asString(record.id, username),
    email: asString(record.email),
    username,
    name: asString(record.name),
    title: asNullableString(record.title),
    bio: asNullableString(record.bio),
    avatar: asNullableString(record.avatar),
    github_handle: asNullableString(record.github_handle),
    linkedin_url: asNullableString(record.linkedin_url),
    roles: asArray(record.roles, (item) => asString(item)),
    skills: asArray(record.skills, (item) => asString(item)),
    is_verified: asBoolean(record.is_verified),
    created_at: asString(record.created_at),
  };
}

export function adaptMatchProfile(value: unknown): MatchProfile {
  const record = requireRecord(value, 'match profile');
  return {
    user: adaptAuthUser(record.user),
    score: asNullableNumber(record.score),
    matched_skills: asArray(record.matched_skills, (item) => asString(item)),
    matched_interests: asArray(record.matched_interests, (item) => asString(item)),
  };
}

export function adaptTeamSummary(value: unknown): TeamSummary {
  const record = requireRecord(value, 'team');
  const slug = asString(record.slug);
  const name = asString(record.name);
  if (!slug || !name) throw new ApiError('Team missing slug or name', 422, 'malformed_payload');
  return {
    id: asString(record.id, slug),
    slug,
    name,
    hackathonId: asString(record.hackathon_id),
    track: asString(record.track),
    status: adaptTeamStatus(record.status),
    activityLevel: adaptActivityLevel(record.activity_level),
    rank: asNumber(record.rank),
    score: asNumber(record.score),
    scoreTrend: asString(record.score_trend),
    createdAt: toDateTimeString(record.created_at),
  };
}

export function adaptTeamInvite(value: unknown): TeamInvite {
  const record = requireRecord(value, 'team invite');
  const name = asString(record.name);
  if (!name) throw new ApiError('Team invite missing name', 422, 'malformed_payload');
  return {
    teamId: asString(record.team_id),
    slug: asString(record.slug),
    name,
    inviteCode: asString(record.invite_code),
  };
}

export function adaptRegistration(value: unknown): Registration {
  const record = requireRecord(value, 'registration');
  return {
    id: asString(record.id),
    userId: asString(record.user_id),
    hackathonId: asString(record.hackathon_id),
    teamName: asNullableString(record.team_name),
    track: asNullableString(record.track),
    teamSize: asNumber(record.team_size),
    status: asString(record.status),
    paymentStatus: asString(record.payment_status),
    registeredAt: toDateTimeString(record.registered_at),
  };
}

export function adaptNotification(value: unknown): Notification {
  const record = requireRecord(value, 'notification');
  const title = asString(record.title);
  if (!title) throw new ApiError('Notification missing title', 422, 'malformed_payload');
  return {
    id: asString(record.id),
    title,
    body: asNullableString(record.body),
    type: asString(record.type),
    readAt: asNullableString(record.read_at),
    createdAt: toDateTimeString(record.created_at),
  };
}

export function adaptNotificationSummary(value: unknown): NotificationSummary {
  const record = requireRecord(value, 'notification summary');
  return {
    totalCount: asNumber(record.total_count),
    unreadCount: asNumber(record.unread_count),
  };
}

export function adaptAnnouncement(value: unknown): Announcement {
  const record = requireRecord(value, 'announcement');
  const title = asString(record.title);
  if (!title) throw new ApiError('Announcement missing title', 422, 'malformed_payload');
  return {
    id: asString(record.id),
    hackathonId: asString(record.hackathon_id),
    createdBy: asNullableString(record.created_by),
    title,
    body: asNullableString(record.body),
    recipientCount: asNumber(record.recipient_count),
    createdAt: toDateTimeString(record.created_at),
  };
}

export function adaptPaymentOrder(value: unknown): PaymentOrder {
  const record = requireRecord(value, 'payment order');
  return {
    orderId: asString(record.order_id),
    amountInr: asNumber(record.amount_inr),
    currency: asString(record.currency),
    keyId: asString(record.key_id),
    registrationId: asString(record.registration_id),
  };
}

export function adaptPaymentVerification(value: unknown): PaymentVerification {
  const record = requireRecord(value, 'payment verification');
  return {
    status: asString(record.status),
    paymentStatus: asString(record.payment_status),
    registrationId: asString(record.registration_id),
  };
}

export function adaptStanding(value: unknown): Standing {
  const record = requireRecord(value, 'standing');
  const projectName = asString(record.project_name);
  if (!projectName) throw new ApiError('Standing missing project_name', 422, 'malformed_payload');
  return {
    id: asString(record.submission_id),
    teamId: asString(record.team_id),
    teamName: asString(record.team_name),
    teamSlug: asString(record.team_slug),
    hackathonId: asString(record.hackathon_id),
    track: asString(record.track),
    projectName,
    tagline: asString(record.tagline),
    description: asString(record.description),
    repoUrl: asString(record.repo_url),
    demoUrl: asString(record.demo_url),
    presentationUrl: asString(record.presentation_url),
    techStack: asArray(record.tech_stack, (item) => asString(item)),
    submittedAt: toDateTimeString(record.submitted_at),
    status: adaptSubmissionStatus(record.status),
    evaluationCount: asNumber(record.evaluation_count),
    averageScore: asNumber(record.average_score),
    score: asNumber(record.score),
    rank: asNumber(record.rank),
  };
}
