import type { AuthUser } from '@/lib/auth/types';

export type HackathonStatus = 'UPCOMING' | 'LIVE' | 'JUDGING' | 'COMPLETED';

export type TeamStatus = 'ACTIVE' | 'IDLE' | 'AT_RISK' | 'SUBMITTED' | 'JUDGING' | 'DISQUALIFIED';

export type ActivityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INACTIVE';

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'EVALUATED';

export interface Track {
  id: string;
  name: string;
  description: string;
  prize: string;
}

export interface TimelinePhase {
  id: string;
  name: string;
  date: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'Title' | 'Platinum' | 'Gold' | 'Track';
  logo: string;
}

export interface Hackathon {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  organization: string;
  organizationLogo?: string;
  status: HackathonStatus;
  startDate: string;
  endDate: string;
  durationHours: number;
  location: string;
  isOnline: boolean;
  prizePool: string;
  participantsCount: number;
  teamsCount: number;
  submissionRate: number;
  judgingRate: number;
  activeTeamsCount: number;
  tracks: Track[];
  timeline: TimelinePhase[];
  prizes: { title: string; amount: string; description: string }[];
  rules: string[];
  sponsors: Sponsor[];
  faqs: { question: string; answer: string }[];
  description: string;
}

export interface CompetitionHistoryItem {
  id: string;
  hackathonName: string;
  year: string;
  result: string;
  badge: 'Winner' | 'Finalist' | 'Top 10' | 'Participant';
  score: number;
}

export interface Participant {
  id: string;
  username: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  roles: string[];
  skills: string[];
  githubHandle: string;
  linkedinUrl: string;
  stats: {
    hackathonsCount: number;
    wins: number;
    finals: number;
    projectsCount: number;
  };
  projects: {
    name: string;
    description: string;
    hackathonName: string;
    year: string;
  }[];
  competitionHistory: CompetitionHistoryItem[];
}

export interface TeamMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  contributionPercentage: number;
}

export interface TeamActivityItem {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  detail: string;
  type: 'pr' | 'commit' | 'issue' | 'task' | 'merge';
}

export interface TeamTask {
  id: string;
  title: string;
  assignee: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  rank: number;
  score: number;
  hackathonId: string;
  hackathonTitle: string;
  track: string;
  status: TeamStatus;
  activityLevel: ActivityLevel;
  scoreTrend: string; // e.g. '+2.1', '-1.4', '—'
  members: TeamMember[];
  project: {
    id: string;
    name: string;
    tagline: string;
    description: string;
    repoUrl: string;
    demoUrl: string;
    presentationUrl: string;
    techStack: string[];
    screenshots: string[];
    commitsCount: number;
    prsCount: number;
    issuesCount: number;
    tasksCount: number;
    activeDays: number;
  };
  tasks: TeamTask[];
  contributionSplit: { name: string; percentage: number }[];
  activityLog: TeamActivityItem[];
}

export interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  teamSlug: string;
  hackathonId: string;
  track: string;
  projectName: string;
  tagline: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  presentationUrl: string;
  techStack: string[];
  submittedAt: string;
  status: SubmissionStatus;
  evaluationCount: number;
  averageScore: number;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
  avatar: string;
  organization: string;
  role: string;
  assignedTeamsCount: number;
  completedCount: number;
  remainingCount: number;
}

export interface RubricScores {
  innovation: number;   // Max 30
  technical: number;    // Max 30
  impact: number;       // Max 20
  ux: number;           // Max 10
  presentation: number; // Max 10
}

export interface Evaluation {
  id: string;
  judgeId: string;
  judgeName: string;
  teamId: string;
  teamName: string;
  hackathonId: string;
  scores: RubricScores;
  totalScore: number;
  notes: string;
  status: 'DRAFT' | 'SAVED' | 'SUBMITTED';
  updatedAt: string;
}

// --- API client additions (Phase 1) ---

/** Shape of the error body emitted by the FastAPI backend (AppError handler). */
export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: unknown;
}

/** Result returned by saveEvaluation (mirrors the mockApi contract). */
export interface SaveEvaluationResult {
  success: boolean;
  totalScore: number;
  updatedAt: string;
}

export type Availability = 'full-time' | 'part-time' | 'weekends-only';

export interface MatchingPreferences {
  skills: string[];
  interests: string[];
  goals: string[];
  desired_roles: string[];
  seeking_team: boolean;
  availability: Availability;
  title?: string | null;
}

export interface MatchProfile {
  user: AuthUser;
  score?: number | null;
  matched_skills: string[];
  matched_interests: string[];
}

export type MatchCandidate = MatchProfile;

export type DirectoryEntry = MatchProfile;

export interface DirectoryFilters {
  role?: string;
  skills?: string;
  q?: string;
  limit?: number;
}

export interface TeamCreatePayload {
  slug: string;
  name: string;
  hackathon_id: string;
  track?: string | null;
}

export interface TeamSummary {
  id: string;
  slug: string;
  name: string;
  hackathonId: string;
  track: string;
  status: TeamStatus;
  activityLevel: ActivityLevel;
  rank: number;
  score: number;
  scoreTrend: string;
  createdAt: string;
}

export interface TeamInvite {
  teamId: string;
  slug: string;
  name: string;
  inviteCode: string;
}

export interface SubmissionCreatePayload {
  team_id: string;
  hackathon_id: string;
  track?: string | null;
  project_name: string;
  tagline?: string | null;
  description?: string | null;
  repo_url?: string | null;
  demo_url?: string | null;
  presentation_url?: string | null;
  tech_stack?: string[];
}

export interface RegistrationCreatePayload {
  hackathon_id: string;
  team_name?: string | null;
  track?: string | null;
  team_size?: number;
}

export interface Registration {
  id: string;
  userId: string;
  hackathonId: string;
  teamName: string | null;
  track: string | null;
  teamSize: number;
  status: string;
  paymentStatus: string;
  registeredAt: string;
}

export interface AnnouncementCreatePayload {
  title: string;
  body?: string | null;
}

export interface Announcement {
  id: string;
  hackathonId: string;
  createdBy: string | null;
  title: string;
  body: string | null;
  recipientCount: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
}

export interface PaymentOrderCreatePayload {
  hackathon_id: string;
  team_name?: string | null;
  track?: string | null;
  team_size?: number;
  amount_inr: number;
  name: string;
  email: string;
}

export interface PaymentOrder {
  orderId: string;
  amountInr: number;
  currency: string;
  keyId: string;
  registrationId: string;
}

export interface PaymentVerifyPayload {
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface PaymentVerification {
  status: string;
  paymentStatus: string;
  registrationId: string;
}

export interface UserUpdatePayload {
  name?: string;
  title?: string;
  bio?: string;
  avatar?: string;
  github_handle?: string;
  linkedin_url?: string;
  skills?: string[];
}

export interface Standing extends Submission {
  score: number;
  rank: number;
}
