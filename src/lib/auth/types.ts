export type AppRole = 'Participant' | 'Organizer' | 'Judge';

export type AuthMode = 'live' | 'demo';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar: string | null;
  github_handle: string | null;
  linkedin_url: string | null;
  roles: string[];
  skills: string[];
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  name: string;
  password: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  title?: string;
  bio?: string;
  avatar?: string;
  github_handle?: string;
  linkedin_url?: string;
  skills?: string[];
}

export interface Session {
  user: AuthUser;
  accessToken: string | null;
  mode: AuthMode;
}
