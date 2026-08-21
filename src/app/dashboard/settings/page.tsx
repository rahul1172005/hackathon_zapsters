'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { SignOutModal } from '@/components/modals/SignOutModal';
import * as api from '@/lib/api';
import { DEFAULT_AVATAR } from '@/lib/auth/roles';
import { GithubIcon } from '@/components/ui/Icons';
import {
  Settings,
  User,
  Shield,
  Bell,
  LogOut,
  Check,
  Edit3,
  KeyRound,
  ExternalLink,
  Smartphone,
  Activity,
  Trophy,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [title, setTitle] = useState('');
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    avatar: string;
    handle: string;
  }>({
    name: 'Rahul Sharma',
    email: 'student@zapsters.dev',
    role: 'Participant',
    avatar: DEFAULT_AVATAR,
    handle: 'rahul-ai-dev',
  });

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [teamInvites, setTeamInvites] = useState(true);
  const [judgeFeedbackAlerts, setJudgeFeedbackAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('zapsters_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            const av = typeof parsed.avatar === 'string' ? parsed.avatar : '';
            const cleanAv = (av.includes('photo-1534528741775-53994a69daeb') || av.includes('unsplash.com/photo-1507003211169') || av.includes('unsplash.com/photo-1494790108377') || av.includes('unsplash.com/photo-1500648767791')) ? '' : av;
            setUser((prev) => ({
              ...prev,
              ...parsed,
              avatar: cleanAv,
            }));
          } catch {
            // fallback to defaults
          }
        }
      }
    }, 0);
    (async () => {
      let savedAvatar: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('zapsters_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (typeof parsed.avatar === 'string') {
              const av = parsed.avatar;
              savedAvatar = (av.includes('photo-1534528741775-53994a69daeb') || av.includes('unsplash.com/photo-1507003211169') || av.includes('unsplash.com/photo-1494790108377') || av.includes('unsplash.com/photo-1500648767791')) ? '' : av;
            }
          } catch {}
        }
      }
      const participant = await api.getParticipant();
      if (cancelled || !participant) return;
      setTitle(participant.title ?? '');
      const apiAv = (participant.avatar && !participant.avatar.includes('photo-1534528741775-53994a69daeb')) ? participant.avatar : '';
      setUser((prev) => ({
        ...prev,
        name: participant.name || prev.name,
        avatar: savedAvatar !== null ? savedAvatar : apiAv,
        handle: participant.githubHandle ?? prev.handle,
      }));
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zapsters_auth');
      localStorage.removeItem('zapsters_user');
      window.dispatchEvent(new Event('storage'));
    }
    setShowSignOutModal(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] text-[#111111] dark:text-white flex font-inter">
      {/* Participant Sidebar */}
      <ParticipantSidebar />

      {/* Main Settings Content Workspace — Full width to fill side space */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full">
        {/* Top Header Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-5 sm:p-8 rounded-3xl shadow-xs space-y-2 border border-[#E5E5E2] dark:border-neutral-800 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">
                  Account Settings & Security
                </h1>
                <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
                  Manage your credentials, session security, notification triggers, and sign-out controls.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/profile"
                className="px-4 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-bold rounded-full transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid — Fully Fills Side Space */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

          {/* Left / Main Settings Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section 1: Account Profile Summary */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] p-6 sm:p-8 space-y-6 rounded-3xl shadow-xs border border-[#E5E5E2] dark:border-neutral-800">
              <div className="flex justify-between items-center pb-1">
                <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#800000]" /> Profile Accreditation
                </h2>
                <Link
                  href="/dashboard/profile"
                  className="text-xs font-bold text-[#800000] dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  View Public Profile <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#800000]/30 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#800000] text-white font-geist font-bold text-2xl flex items-center justify-center shadow-xs border-2 border-[#800000]/30 shrink-0 select-none">
                    {user.name?.trim().charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-geist font-bold text-[#111111] dark:text-white">
                      {user.name}
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-[#800000] dark:text-red-400 uppercase">
                      • {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#777777] dark:text-neutral-400 font-mono">
                    {user.email}
                  </p>
                  <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
                    {title} • @{user.handle}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Security & Session Controls */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] p-6 sm:p-8 space-y-6 rounded-3xl shadow-xs border border-[#E5E5E2] dark:border-neutral-800">
              <div className="pb-1">
                <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#800000]" /> Active Session & Authentication
                </h2>
              </div>

              <div className="space-y-4 text-xs font-inter">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#111111] dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#800000] dark:bg-red-500 animate-pulse" /> Persistent Session Active
                    </div>
                    <div className="text-[#777777] dark:text-neutral-400 text-[11px]">
                      Your authentication state (`zapsters_auth`) stays signed in across app reloads.
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#800000] dark:text-red-400 uppercase self-start sm:self-center">
                    PERSISTENT SIGN-IN ACTIVE
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#111111] dark:text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#800000]" /> Update Password & Credentials
                    </div>
                    <div className="text-[#777777] dark:text-neutral-400 text-[11px]">
                      Secure your hacker workspace with multi-factor encryption.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email.')}
                    className="px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-[#111111] dark:text-white font-bold rounded-full border border-neutral-300 dark:border-neutral-700 transition-colors shadow-xs"
                  >
                    Change Password
                  </button>
                </div>

                {/* Linked Social Accounts */}
                <div className="p-4 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="font-bold text-[#111111] dark:text-white text-xs uppercase tracking-wider text-[11px]">
                    LINKED IDENTITY PROVIDERS
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-black rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold">
                      <GithubIcon className="w-4 h-4 text-[#111111] dark:text-white" />
                      <span>GitHub (@{user.handle})</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#800000] dark:text-red-400 ml-1" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-black rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold opacity-60">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>Google OAuth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Notification Toggles */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] p-6 sm:p-8 space-y-6 rounded-3xl shadow-xs border border-[#E5E5E2] dark:border-neutral-800">
              <div className="pb-1">
                <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#800000]" /> Communication & Alert Preferences
                </h2>
              </div>

              <div className="space-y-3 text-xs font-inter">
                <label className="flex items-center justify-between p-4 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
                  <div>
                    <div className="font-bold text-[#111111] dark:text-white">Email Digest & Submissions</div>
                    <div className="text-[#777777] dark:text-neutral-400 text-[11px]">Receive hackathon milestone and scoring updates</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#800000] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
                  <div>
                    <div className="font-bold text-[#111111] dark:text-white">Team Invitations & Activity</div>
                    <div className="text-[#777777] dark:text-neutral-400 text-[11px]">Instant notifications for team requests and task assignments</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={teamInvites}
                    onChange={(e) => setTeamInvites(e.target.checked)}
                    className="w-4 h-4 accent-[#800000] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
                  <div>
                    <div className="font-bold text-[#111111] dark:text-white">Judge Score Alerts</div>
                    <div className="text-[#777777] dark:text-neutral-400 text-[11px]">Get alerted when judges submit evaluations for your projects</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={judgeFeedbackAlerts}
                    onChange={(e) => setJudgeFeedbackAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#800000] cursor-pointer"
                  />
                </label>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-bold rounded-full transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {savedSuccess ? <Check className="w-4 h-4 text-white" /> : null}
                    {savedSuccess ? 'Preferences Saved!' : 'Save Notification Rules'}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Account Actions & Danger Zone */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] p-6 sm:p-8 space-y-6 rounded-3xl shadow-xs border border-red-500/20">
              <div className="pb-1">
                <h2 className="text-base font-geist font-bold text-[#800000] dark:text-red-400 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Account Session Actions
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-red-500/5 dark:bg-red-950/20 rounded-2xl border border-red-500/20">
                <div className="space-y-1">
                  <h3 className="text-sm font-geist font-bold text-[#111111] dark:text-white">
                    Sign Out of Zapsters Workspace
                  </h3>
                  <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter max-w-md">
                    This will terminate your current session on this device. You will need to log back in to access your teams and hackathon dashboard.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSignOutModal(true)}
                  className="px-6 py-3 bg-[#800000] hover:bg-[#660000] text-white text-xs font-bold rounded-full transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">

            {/* Account Quick Status Card */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] p-6 space-y-5 rounded-3xl shadow-xs border border-[#E5E5E2] dark:border-neutral-800">
              <div className="flex items-center gap-3 pb-1">
                <div className="w-10 h-10 rounded-2xl bg-[#800000]/10 text-[#800000] flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-geist font-bold text-[#111111] dark:text-white">Hacker Credentials</h3>
                  <p className="text-[10px] text-[#777777] dark:text-neutral-400 font-inter uppercase tracking-wider">PLATFORM RANKING</p>
                </div>
              </div>

              <div className="space-y-3 font-inter text-xs">
                <div className="flex justify-between items-center p-3 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-xl">
                  <span className="text-[#777777] dark:text-neutral-400 font-semibold">CURRENT TIER:</span>
                  <span className="font-bold text-[#800000] dark:text-red-400">Initiator (Level 3)</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-xl">
                  <span className="text-[#777777] dark:text-neutral-400 font-semibold">REGISTERED TEAM:</span>
                  <span className="font-bold text-[#111111] dark:text-white">CyberForge (#03)</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-xl">
                  <span className="text-[#777777] dark:text-neutral-400 font-semibold">SHIPPED PROJECTS:</span>
                  <span className="font-bold text-[#111111] dark:text-white">4 Verified Repos</span>
                </div>
              </div>
            </div>

            {/* Security Audit & Activity Log */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] p-6 space-y-5 rounded-3xl shadow-xs border border-[#E5E5E2] dark:border-neutral-800">
              <div className="flex items-center gap-3 pb-1">
                <div className="w-10 h-10 rounded-2xl bg-[#800000]/10 text-[#800000] flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-geist font-bold text-[#111111] dark:text-white">Security & Audit Log</h3>
                  <p className="text-[10px] text-[#777777] dark:text-neutral-400 font-inter uppercase tracking-wider">ACTIVE CONNECTIONS</p>
                </div>
              </div>

              <div className="space-y-3 font-inter text-xs">
                <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-[#111111] dark:text-white text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#800000]" /> Windows Web Desktop
                    </span>
                    <span className="text-[10px] text-[#800000] dark:text-red-400 font-mono font-bold">Current</span>
                  </div>
                  <div className="text-[10px] text-[#777777] dark:text-neutral-400 font-mono">
                    IP: 127.0.0.1 • Session Token: `zapsters_auth`
                  </div>
                </div>

                <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-[#111111] dark:text-white text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#800000]" /> SSL / TLS Protocol
                    </span>
                    <span className="text-[10px] text-[#777777] font-mono">256-bit</span>
                  </div>
                  <div className="text-[10px] text-[#777777] dark:text-neutral-400 font-inter">
                    Encrypted platform communication channel
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] p-6 space-y-4 rounded-3xl shadow-xs border border-[#E5E5E2] dark:border-neutral-800">
              <h3 className="text-sm font-geist font-bold text-[#111111] dark:text-white">Workspace Shortcuts</h3>
              <div className="space-y-2 text-xs font-inter">
                <Link
                  href="/dashboard/profile"
                  className="group flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] dark:bg-neutral-900/60 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 transition-colors font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#800000]" /> Hacker Profile
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777] dark:text-neutral-400 group-hover:text-[#111111] dark:group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/my-teams"
                  className="group flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] dark:bg-neutral-900/60 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 transition-colors font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#800000]" /> My Teams
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777] dark:text-neutral-400 group-hover:text-[#111111] dark:group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/dashboard/leaderboard"
                  className="group flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] dark:bg-neutral-900/60 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 transition-colors font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#800000]" /> Global Leaderboard
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777] dark:text-neutral-400 group-hover:text-[#111111] dark:group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Sign Out Confirmation Pop-up Modal */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  );
}
