'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SignOutModal } from '@/components/modals/SignOutModal';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Activity,
  User,
  Send,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  Settings,
  LogOut,
} from 'lucide-react';

export const ParticipantSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [userName, setUserName] = useState('Rahul Sharma');
  const [userAvatar, setUserAvatar] = useState<string>('');

  useEffect(() => {
    const syncUser = () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('zapsters_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.name) setUserName(parsed.name);
            if (typeof parsed.avatar === 'string') {
              const av = parsed.avatar;
              if (av.includes('photo-1534528741775-53994a69daeb') || av.includes('unsplash.com/photo-1507003211169') || av.includes('unsplash.com/photo-1494790108377') || av.includes('unsplash.com/photo-1500648767791')) {
                setUserAvatar('');
              } else {
                setUserAvatar(av);
              }
            }
          } catch {}
        }
      }
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const firstLetter = userName ? userName.trim().charAt(0).toUpperCase() : 'R';

  const teamIdMatch = pathname ? pathname.match(/\/my-teams\/([^/]+)/) : null;
  const activeTeamId = teamIdMatch ? teamIdMatch[1] : 'team-003';

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { label: 'My Hackathons', href: '/my-hackathons', icon: Layers },
    { label: 'My Teams', href: '/my-teams', icon: Users },
    { label: 'Team Activity', href: `/my-teams/${activeTeamId}/activity`, icon: Activity },
    { label: 'Submit Project', href: `/my-teams/${activeTeamId}/submission`, icon: Send },
    { label: 'Public Profile', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  // Mobile bottom nav items (subset — most important 5)
  const mobileNavItems = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Teams', href: '/my-teams', icon: Users },
    { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ];

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
    <>
      {/* ===================== MOBILE TOP HEADER BAR ===================== */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-inter transition-colors">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs shadow-xs">
            Z
          </div>
          <span className="font-geist font-bold text-sm text-[#111111] dark:text-white tracking-tight">
            Dashboard
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/dashboard/profile"
            className="w-8 h-8 rounded-full bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs shrink-0 shadow-xs overflow-hidden"
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              firstLetter
            )}
          </Link>
        </div>
      </header>

      {/* ===================== DESKTOP SIDEBAR ===================== */}
      <aside
        className={`hidden lg:flex sticky top-0 h-screen bg-transparent flex-col select-none font-inter shrink-0 transition-all duration-300 z-40 ${
          isCollapsed ? 'w-20' : 'w-60'
        }`}
      >
        {/* Top Header & Toggle Button */}
        <div className="p-3 bg-[#FFFFFF] dark:bg-[#141414] rounded-2xl m-3 flex items-center justify-between gap-2 overflow-hidden shadow-xs dark:border dark:border-neutral-800">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    firstLetter
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-geist font-bold text-[#111111] dark:text-white truncate">{userName}</h2>
                </div>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                title="Minimize Sidebar"
                className="w-7 h-7 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#111111] rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#800000]" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2.5 w-full">
              <div className="w-8 h-8 rounded-full bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  firstLetter
                )}
              </div>
              <button
                onClick={() => setIsCollapsed(false)}
                title="Maximize Sidebar"
                className="w-7 h-7 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#111111] rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-[#800000]" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-2 overflow-y-auto no-scrollbar">
          {!isCollapsed && (
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white font-inter font-semibold transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Public Home
            </Link>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 transition-all ${
                  isCollapsed
                    ? 'justify-center w-10 h-10 mx-auto rounded-full'
                    : 'px-4 py-2.5 rounded-full text-xs font-inter font-medium'
                } ${
                  isActive
                    ? 'bg-[#800000] text-white font-bold shadow-xs'
                    : 'text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white hover:bg-[#FFFFFF] dark:hover:bg-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#777777] dark:text-neutral-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info & Sign Out */}
        {!isCollapsed ? (
          <div className="p-3 bg-[#FFFFFF] dark:bg-[#141414] rounded-2xl m-3 font-inter text-[11px] text-[#777777] dark:text-neutral-400 space-y-2 shadow-xs border border-transparent dark:border-neutral-800">
            <div className="flex justify-between items-center">
              <span>THEME:</span>
              <ThemeToggle />
            </div>
            <div className="flex justify-between pt-1">
              <span>TEAM:</span>
              <span className="font-bold text-[#111111] dark:text-white">CyberForge</span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-[#800000] dark:text-red-400 rounded-xl font-bold transition-colors cursor-pointer text-xs"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setShowSignOutModal(true)}
              title="Sign Out"
              className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 text-[#800000] dark:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* ===================== MOBILE BOTTOM NAV BAR ===================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-1 pt-1.5 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all min-w-[56px] ${
                  isActive
                    ? 'text-[#800000] dark:text-red-400 font-bold'
                    : 'text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-[#800000]/10 dark:bg-red-500/10' : ''}`}>
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#800000] dark:text-red-400' : 'text-[#777777] dark:text-neutral-400'}`} />
                </div>
                <span className={`text-[10px] font-inter leading-none ${isActive ? 'font-bold text-[#800000] dark:text-red-400' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign Out Confirmation Pop-up Modal */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </>
  );
};
