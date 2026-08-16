import type {
  AppRole,
  AuthResponse,
  AuthUser,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
} from './types';
import { DEFAULT_AVATAR, roleFromEmail } from './roles';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function makeDemoUser(
  payload: { email: string; name: string; username: string },
  role: AppRole,
): AuthUser {
  const name =
    payload.name ||
    (role === 'Organizer' ? 'Admin Organizer' : role === 'Judge' ? 'Elena Rostova' : 'Rahul Sharma');
  const username =
    payload.username ||
    (role === 'Organizer' ? 'admin' : role === 'Judge' ? 'elena_judge' : 'rahulsharma');

  return {
    id: `demo-${Date.now().toString(36)}`,
    email: payload.email.toLowerCase(),
    username,
    name,
    title:
      role === 'Organizer'
        ? 'Hackathon Organizer'
        : role === 'Judge'
          ? 'Competition Judge'
          : 'AI / ML · Full Stack Developer',
    bio: null,
    avatar: DEFAULT_AVATAR,
    github_handle: role === 'Participant' ? 'rahul-ai-dev' : null,
    linkedin_url: null,
    roles: [role.toLowerCase()],
    skills: role === 'Participant' ? ['Python', 'PyTorch', 'TypeScript', 'Next.js', 'FastAPI'] : [],
    is_verified: true,
    created_at: new Date().toISOString(),
  };
}

export async function demoLogin(payload: LoginPayload, roleHint?: AppRole): Promise<AuthResponse> {
  await delay();
  const role = roleHint ?? roleFromEmail(payload.email);
  const username =
    (payload.email.split('@')[0] ?? 'user').replace(/[^a-zA-Z0-9_]/g, '') || 'user';
  const user = makeDemoUser({ email: payload.email, name: '', username }, role);
  return { user, access_token: `demo-${user.id}`, token_type: 'bearer' };
}

export async function demoRegister(payload: RegisterPayload): Promise<AuthResponse> {
  await delay();
  const user = makeDemoUser(
    { email: payload.email, name: payload.name, username: payload.username },
    'Participant',
  );
  return { user, access_token: `demo-${user.id}`, token_type: 'bearer' };
}

export async function demoUpdateProfile(
  user: AuthUser,
  payload: ProfileUpdatePayload,
): Promise<AuthUser> {
  await delay();
  const updates: Partial<AuthUser> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) updates[key as keyof AuthUser] = value as never;
  }
  return { ...user, ...updates };
}
