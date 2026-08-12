import {
  MOCK_HACKATHONS,
  MOCK_PARTICIPANT,
  MOCK_TEAMS,
  MOCK_SUBMISSIONS,
  MOCK_JUDGES,
  MOCK_EVALUATIONS,
} from './mockData';
import {
  Hackathon,
  Participant,
  Team,
  Submission,
  Judge,
  Evaluation,
  RubricScores,
} from '@/types';

// Helper to simulate asynchronous latency (API-ready architecture)
const delay = (ms: number = 80) => new Promise((res) => setTimeout(res, ms));

export async function getHackathons(): Promise<Hackathon[]> {
  await delay();
  return MOCK_HACKATHONS;
}

export async function getHackathonBySlug(slug: string): Promise<Hackathon | null> {
  await delay();
  const found = MOCK_HACKATHONS.find((h) => h.slug === slug || h.id === slug);
  return found || MOCK_HACKATHONS[0];
}

export async function getParticipant(username?: string): Promise<Participant> {
  await delay();
  if (username && username !== MOCK_PARTICIPANT.username) {
    return { ...MOCK_PARTICIPANT, username, name: username.toUpperCase() };
  }
  return MOCK_PARTICIPANT;
}

export async function getTeams(hackathonId?: string): Promise<Team[]> {
  await delay();
  if (hackathonId) {
    return MOCK_TEAMS.filter((t) => t.hackathonId === hackathonId || hackathonId === 'quantum-build-2026');
  }
  return MOCK_TEAMS;
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  await delay();
  const found = MOCK_TEAMS.find((t) => t.slug === slug || t.id === slug);
  return found || MOCK_TEAMS[2]; // Default to CyberForge for rich demo experience
}

export async function getLeaderboard(hackathonId?: string): Promise<Team[]> {
  await delay();
  const teams = hackathonId ? MOCK_TEAMS.filter(t => t.hackathonId === hackathonId || hackathonId === 'quantum-build-2026') : [...MOCK_TEAMS];
  return teams.sort((a, b) => b.score - a.score);
}

export async function getSubmissions(hackathonId?: string): Promise<Submission[]> {
  await delay();
  return hackathonId ? MOCK_SUBMISSIONS.filter(s => s.hackathonId === hackathonId || hackathonId === 'quantum-build-2026') : MOCK_SUBMISSIONS;
}

export async function getJudges(hackathonId?: string): Promise<Judge[]> {
  await delay();
  if (hackathonId) {
    return MOCK_JUDGES;
  }
  return MOCK_JUDGES;
}

export async function getEvaluation(teamId: string, judgeId: string = 'jdg-001'): Promise<Evaluation | null> {
  await delay();
  const existing = MOCK_EVALUATIONS.find((e) => e.teamId === teamId && e.judgeId === judgeId);
  if (existing) return existing;
  
  // Return default draft evaluation layout
  const team = MOCK_TEAMS.find((t) => t.id === teamId || t.slug === teamId);
  return {
    id: `eval-${Date.now()}`,
    judgeId,
    judgeName: 'Dr. Aris Thorne',
    teamId: team?.id || teamId,
    teamName: team?.name || 'CyberForge',
    hackathonId: 'hack-001',
    scores: {
      innovation: 27,
      technical: 26,
      impact: 17,
      ux: 9,
      presentation: 9,
    },
    totalScore: 88,
    notes: 'Spatial YOLOv9 implementation with edge quantization. Code contribution logs show strong velocity across members.',
    status: 'SAVED',
    updatedAt: new Date().toLocaleString(),
  };
}

export async function saveEvaluation(
  teamId: string,
  scores: RubricScores,
  notes: string,
  status: 'DRAFT' | 'SAVED' | 'SUBMITTED'
): Promise<{ success: boolean; totalScore: number; updatedAt: string }> {
  await delay(120);
  const totalScore = scores.innovation + scores.technical + scores.impact + scores.ux + scores.presentation;
  const updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Update in-memory mock record
  const existingIndex = MOCK_EVALUATIONS.findIndex((e) => e.teamId === teamId);
  if (existingIndex >= 0) {
    MOCK_EVALUATIONS[existingIndex].scores = scores;
    MOCK_EVALUATIONS[existingIndex].totalScore = totalScore;
    MOCK_EVALUATIONS[existingIndex].notes = notes;
    MOCK_EVALUATIONS[existingIndex].status = status;
    MOCK_EVALUATIONS[existingIndex].updatedAt = updatedAt;
  }
  return { success: true, totalScore, updatedAt };
}
