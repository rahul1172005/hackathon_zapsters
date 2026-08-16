import type { AuthUser } from '@/lib/auth/types';
import { apiFetch } from '@/lib/api';
import { getParticipant } from '@/lib/mockApi';

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

/**
 * Shape expected of the real API client (src/lib/api, built in Phase 1).
 * The helpers below delegate to it when a matching function exists and fall
 * back to the in-memory demo provider otherwise.
 */
interface MatchingApiClient {
  getMatchingPreferences?: () => Promise<MatchingPreferences>;
  saveMatchingPreferences?: (prefs: MatchingPreferences) => Promise<MatchingPreferences>;
  leaveMatchingPool?: () => Promise<void>;
  getMatchingRecommendations?: () => Promise<MatchCandidate[]>;
  getMatchingDirectory?: (filters?: DirectoryFilters) => Promise<DirectoryEntry[]>;
}

const PREFS_KEY = 'zapsters_matching_prefs';

// Jaccard weights, mirroring backend/app/services/matching.py.
const SKILL_WEIGHT = 0.6;
const INTEREST_WEIGHT = 0.25;
const GOAL_WEIGHT = 0.15;
const ROLE_MATCH_BONUS = 5;
const ROLE_NEUTRAL_BONUS = 2;

let apiClient: MatchingApiClient | null | undefined;

async function loadApiClient(): Promise<MatchingApiClient | null> {
  if (apiClient !== undefined) return apiClient;
  try {
    // @ts-ignore - resolved lazily; src/lib/api is created by the Phase 1 build.
    const mod = await import('@/lib/api');
    apiClient = mod as unknown as MatchingApiClient;
  } catch {
    apiClient = null;
  }
  return apiClient;
}

async function callApi<T>(name: keyof MatchingApiClient, args: unknown[] = []): Promise<T | undefined> {
  const client = await loadApiClient();
  const fn = client?.[name];
  if (typeof fn !== 'function') return undefined;
  return (await (fn as (...callArgs: unknown[]) => Promise<T>)(...args)) as T;
}

function fromApiUser(raw: unknown): AuthUser {
  const record = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    id: String(record.id ?? ''),
    email: String(record.email ?? ''),
    username: String(record.username ?? ''),
    name: String(record.name ?? ''),
    title: record.title ? String(record.title) : null,
    bio: record.bio ? String(record.bio) : null,
    avatar: record.avatar ? String(record.avatar) : null,
    github_handle: record.github_handle ? String(record.github_handle) : null,
    linkedin_url: record.linkedin_url ? String(record.linkedin_url) : null,
    roles: Array.isArray(record.roles) ? record.roles.map((role) => String(role)) : [],
    skills: Array.isArray(record.skills) ? record.skills.map((skill) => String(skill)) : [],
    is_verified: record.is_verified === true,
    created_at: record.created_at ? String(record.created_at) : '',
  };
}

function fromApiMatchCandidate(raw: unknown): MatchCandidate {
  const record = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    user: fromApiUser(record.user),
    score: typeof record.score === 'number' ? record.score : null,
    matched_skills: Array.isArray(record.matched_skills) ? record.matched_skills.map((skill) => String(skill)) : [],
    matched_interests: Array.isArray(record.matched_interests)
      ? record.matched_interests.map((interest) => String(interest))
      : [],
  };
}

export function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function emptyPreferences(): MatchingPreferences {
  return {
    skills: [],
    interests: [],
    goals: [],
    desired_roles: [],
    seeking_team: true,
    availability: 'part-time',
  };
}

export async function getMatchingPreferences(): Promise<MatchingPreferences> {
  const fromApi = await callApi<MatchingPreferences>('getMatchingPreferences');
  if (fromApi) return fromApi;
  return getStoredPreferences();
}

export async function saveMatchingPreferences(prefs: MatchingPreferences): Promise<MatchingPreferences> {
  const fromApi = await callApi<MatchingPreferences>('saveMatchingPreferences', [prefs]);
  if (fromApi) return fromApi;
  setStoredPreferences(prefs);
  return prefs;
}

export async function leaveMatchingPool(): Promise<void> {
  const client = await loadApiClient();
  if (typeof client?.leaveMatchingPool === 'function') {
    await client.leaveMatchingPool();
    return;
  }
  clearStoredPreferences();
}

export async function getMatchingRecommendations(): Promise<MatchCandidate[]> {
  try {
    const rows = await apiFetch<unknown[]>('/matching/recommendations');
    return (Array.isArray(rows) ? rows : []).map(fromApiMatchCandidate);
  } catch {
    return mockRecommendations();
  }
}

export async function getMatchingDirectory(filters: DirectoryFilters = {}): Promise<DirectoryEntry[]> {
  try {
    const rows = await apiFetch<unknown[]>('/matching/directory', {
      query: {
        role: filters.role,
        skills: filters.skills,
        q: filters.q,
        limit: filters.limit,
      },
    });
    return (Array.isArray(rows) ? rows : []).map(fromApiMatchCandidate);
  } catch {
    return mockDirectory(filters);
  }
}

// ---------------------------------------------------------------------------
// Demo provider — used until src/lib/api exposes the matching endpoints.
// ---------------------------------------------------------------------------

interface MockPoolMember {
  user: AuthUser;
  interests: string[];
  goals: string[];
  desired_roles: string[];
  seeking_team: boolean;
  availability: Availability;
}

async function currentUserProfile(): Promise<AuthUser> {
  const participant = await getParticipant();
  return {
    id: participant.id,
    email: 'rahul@zapsters.dev',
    username: participant.username,
    name: participant.name,
    title: participant.title,
    bio: participant.bio,
    avatar: participant.avatar,
    github_handle: participant.githubHandle,
    linkedin_url: participant.linkedinUrl,
    roles: participant.roles,
    skills: participant.skills,
    is_verified: true,
    created_at: '2026-01-01T00:00:00Z',
  };
}

const AV = 'https://images.unsplash.com/photo-';

const MOCK_POOL: MockPoolMember[] = [
  {
    user: {
      id: 'usr-002',
      email: 'sarah@zapsters.dev',
      username: 'sarah_c',
      name: 'Sarah Chen',
      title: 'AI Lead · ML Engineer',
      bio: 'Building real-time vision and LLM systems. Loves pushing latency budgets below the threshold.',
      avatar: `${AV}1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80`,
      github_handle: 'sarah-chen',
      linkedin_url: 'https://linkedin.com/in/sarahchen',
      roles: ['ML Engineer', 'Team Lead'],
      skills: ['Python', 'PyTorch', 'CUDA', 'TensorRT', 'Rust'],
      is_verified: true,
      created_at: '2026-01-05T00:00:00Z',
    },
    interests: ['LLM Infra', 'Edge AI', 'Spatial Computing'],
    goals: ['Ship a real-time inference demo', 'Win the AI track'],
    desired_roles: ['ML Engineer', 'Team Lead'],
    seeking_team: true,
    availability: 'part-time',
  },
  {
    user: {
      id: 'usr-003',
      email: 'marcus@zapsters.dev',
      username: 'mvance',
      name: 'Marcus Vance',
      title: 'Systems Architect',
      bio: 'Distributed systems and p2p infrastructure. Kubernetes by day, gRPC by night.',
      avatar: `${AV}1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80`,
      github_handle: 'marcus-vance',
      linkedin_url: 'https://linkedin.com/in/marcusvance',
      roles: ['Backend Engineer'],
      skills: ['Go', 'Rust', 'Kubernetes', 'gRPC', 'Docker'],
      is_verified: true,
      created_at: '2026-01-08T00:00:00Z',
    },
    interests: ['Distributed Systems', 'Cloud', 'Networking'],
    goals: ['Scale a service to 100k requests', 'Mentor a junior teammate'],
    desired_roles: ['Backend Engineer'],
    seeking_team: true,
    availability: 'full-time',
  },
  {
    user: {
      id: 'usr-004',
      email: 'elena@zapsters.dev',
      username: 'elena_r',
      name: 'Elena Rostova',
      title: 'Frontend Lead',
      bio: 'Real-time dashboards, design systems and buttery interactions. Obsessed with Core Web Vitals.',
      avatar: `${AV}1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80`,
      github_handle: 'elena-rostova',
      linkedin_url: 'https://linkedin.com/in/elenarostova',
      roles: ['Frontend Developer'],
      skills: ['TypeScript', 'React', 'Next.js', 'TailwindCSS', 'WebRTC'],
      is_verified: true,
      created_at: '2026-01-10T00:00:00Z',
    },
    interests: ['Real-time UI', 'Design Systems', 'Data Viz'],
    goals: ['Build a polished product', 'Improve a11y on every screen'],
    desired_roles: ['Frontend Developer'],
    seeking_team: true,
    availability: 'part-time',
  },
  {
    user: {
      id: 'usr-005',
      email: 'david@zapsters.dev',
      username: 'dkim',
      name: 'David Kim',
      title: 'DevOps / Infra',
      bio: 'CI/CD pipelines, edge deployments and keeping everything green. Cloud certifications collector.',
      avatar: `${AV}1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80`,
      github_handle: 'david-kim',
      linkedin_url: 'https://linkedin.com/in/davidkim',
      roles: ['DevOps'],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
      is_verified: true,
      created_at: '2026-01-12T00:00:00Z',
    },
    interests: ['CI/CD', 'SRE', 'Serverless'],
    goals: ['Automate everything', 'Ship a demo on a tight deadline'],
    desired_roles: ['DevOps', 'Infra'],
    seeking_team: true,
    availability: 'weekends-only',
  },
  {
    user: {
      id: 'usr-006',
      email: 'alex@zapsters.dev',
      username: 'arivera',
      name: 'Alex Rivera',
      title: 'Full Stack Developer',
      bio: 'Full-stack generalist shipping product end to end. Fast prototyper, fast at typing.',
      avatar: `${AV}1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80`,
      github_handle: 'alex-rivera',
      linkedin_url: 'https://linkedin.com/in/alexrivera',
      roles: ['Full Stack Developer'],
      skills: ['TypeScript', 'Next.js', 'FastAPI', 'PostgreSQL', 'React'],
      is_verified: true,
      created_at: '2026-01-15T00:00:00Z',
    },
    interests: ['Web Apps', 'APIs', 'Product'],
    goals: ['Build the product demo', 'Find a teammate to split the work'],
    desired_roles: ['Full Stack Developer'],
    seeking_team: true,
    availability: 'full-time',
  },
  {
    user: {
      id: 'usr-007',
      email: 'priya@zapsters.dev',
      username: 'psharma',
      name: 'Priya Sharma',
      title: 'ML Engineer',
      bio: 'NLP and MLOps enthusiast. Trained models that beat benchmarks and survive production.',
      avatar: `${AV}1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80`,
      github_handle: 'priya-sharma',
      linkedin_url: 'https://linkedin.com/in/priyasharma',
      roles: ['ML Engineer'],
      skills: ['Python', 'PyTorch', 'TensorFlow', 'scikit-learn', 'FastAPI'],
      is_verified: true,
      created_at: '2026-01-18T00:00:00Z',
    },
    interests: ['NLP', 'MLOps', 'Evaluation'],
    goals: ['Win the best ML track', 'Contribute an open-source model'],
    desired_roles: ['ML Engineer'],
    seeking_team: true,
    availability: 'part-time',
  },
  {
    user: {
      id: 'usr-008',
      email: 'kenji@zapsters.dev',
      username: 'ksato',
      name: 'Kenji Sato',
      title: 'Backend Engineer',
      bio: 'Event-driven services and real-time data pipelines. Kafka, Redis and clean async code.',
      avatar: `${AV}1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80`,
      github_handle: 'kenji-sato',
      linkedin_url: 'https://linkedin.com/in/kenjisato',
      roles: ['Backend Engineer'],
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Kafka'],
      is_verified: true,
      created_at: '2026-01-20T00:00:00Z',
    },
    interests: ['Data Pipelines', 'Real-time', 'Event-Driven'],
    goals: ['Build reliable services', 'Learn a new streaming stack'],
    desired_roles: ['Backend Engineer'],
    seeking_team: true,
    availability: 'part-time',
  },
  {
    user: {
      id: 'usr-009',
      email: 'adithya@zapsters.dev',
      username: 'adithya_n',
      name: 'Adithya Nair',
      title: 'Security & QA',
      bio: 'AppSec automation and quality gates. Breaks things on purpose so you do not have to.',
      avatar: `${AV}1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80`,
      github_handle: 'adithya-nair',
      linkedin_url: 'https://linkedin.com/in/adithyanair',
      roles: ['Security Engineer', 'QA'],
      skills: ['Python', 'OWASP', 'Selenium', 'Docker', 'Linux'],
      is_verified: true,
      created_at: '2026-01-22T00:00:00Z',
    },
    interests: ['AppSec', 'Automation', 'Zero Trust'],
    goals: ['Ship secure code', 'Run a bug bounty on the demo'],
    desired_roles: ['Security Engineer'],
    seeking_team: true,
    availability: 'weekends-only',
  },
];

function toPreferences(member: MockPoolMember): MatchingPreferences {
  return {
    skills: member.user.skills,
    interests: member.interests,
    goals: member.goals,
    desired_roles: member.desired_roles,
    seeking_team: member.seeking_team,
    availability: member.availability,
    title: member.user.title,
  };
}

async function getStoredPreferences(): Promise<MatchingPreferences> {
  if (typeof window === 'undefined') return emptyPreferences();
  const raw = window.localStorage.getItem(PREFS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as MatchingPreferences;
    } catch {
      // corrupted entry — fall through to defaults
    }
  }
  const profile = await currentUserProfile();
  return {
    skills: profile.skills,
    interests: ['Artificial Intelligence', 'Computer Vision', 'Edge Computing'],
    goals: ['Build a production-grade demo', 'Win the AI track'],
    desired_roles: ['Full Stack Developer', 'ML Engineer'],
    seeking_team: true,
    availability: 'part-time',
    title: profile.title,
  };
}

function setStoredPreferences(prefs: MatchingPreferences): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function clearStoredPreferences(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PREFS_KEY);
}

function normalizeTags(values: string[]): string[] {
  return values.map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  let intersection = 0;
  for (const value of setA) {
    if (setB.has(value)) intersection += 1;
  }
  return intersection / union.size;
}

function scoreMatch(a: MatchingPreferences, b: MatchingPreferences): {
  score: number;
  matched_skills: string[];
  matched_interests: string[];
} {
  const aSkills = normalizeTags(a.skills);
  const bSkills = normalizeTags(b.skills);
  const aInterests = normalizeTags(a.interests);
  const bInterests = normalizeTags(b.interests);
  const aGoals = normalizeTags(a.goals);
  const bGoals = normalizeTags(b.goals);

  const base =
    100 *
    (SKILL_WEIGHT * jaccard(aSkills, bSkills) +
      INTEREST_WEIGHT * jaccard(aInterests, bInterests) +
      GOAL_WEIGHT * jaccard(aGoals, bGoals));

  const desiredRoles = normalizeTags(a.desired_roles);
  const candidateRoles = normalizeTags(b.desired_roles);
  if (b.title) candidateRoles.push(b.title.trim().toLowerCase());
  const roleBonus =
    desiredRoles.length > 0 && candidateRoles.length > 0
      ? desiredRoles.some((role) => candidateRoles.includes(role))
        ? ROLE_MATCH_BONUS
        : 0
      : ROLE_NEUTRAL_BONUS;

  return {
    score: Math.max(0, Math.min(100, Math.round(base + roleBonus))),
    matched_skills: b.skills.filter((skill) => aSkills.includes(skill.trim().toLowerCase())),
    matched_interests: b.interests.filter((interest) => aInterests.includes(interest.trim().toLowerCase())),
  };
}

async function mockRecommendations(): Promise<MatchCandidate[]> {
  const [prefs, profile] = await Promise.all([getStoredPreferences(), currentUserProfile()]);
  if (!prefs.seeking_team) return [];
  return MOCK_POOL.filter((member) => member.seeking_team && member.user.id !== profile.id)
    .map((member) => {
      const { score, matched_skills, matched_interests } = scoreMatch(prefs, toPreferences(member));
      return { user: member.user, score, matched_skills, matched_interests };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

async function mockDirectory(filters: DirectoryFilters): Promise<DirectoryEntry[]> {
  const profile = await currentUserProfile();
  const wanted = normalizeTags(splitTags(filters.skills ?? ''));
  const role = filters.role?.trim().toLowerCase();
  const query = filters.q?.trim().toLowerCase();

  return MOCK_POOL.filter((member) => member.user.id !== profile.id)
    .filter((member) => {
      if (role) {
        const haystacks = [member.user.title ?? '', ...member.user.roles];
        if (!haystacks.some((entry) => entry.toLowerCase().includes(role))) return false;
      }
      if (query) {
        const haystacks = [member.user.name, member.user.username, member.user.bio ?? '', member.user.title ?? ''];
        if (!haystacks.some((entry) => entry.toLowerCase().includes(query))) return false;
      }
      return true;
    })
    .map((member) => {
      const matched_skills = member.user.skills.filter((skill) => wanted.includes(skill.trim().toLowerCase()));
      const score = wanted.length > 0 ? Math.round(jaccard(wanted, member.user.skills) * 100) : null;
      return { user: member.user, matched_skills, matched_interests: [], score };
    })
    .sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) || a.user.name.localeCompare(b.user.name),
    )
    .slice(0, filters.limit ?? 50);
}
