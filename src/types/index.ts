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
