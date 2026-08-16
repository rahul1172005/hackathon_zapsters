'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SignOutModal } from '@/components/modals/SignOutModal';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  FileCheck2,
  Scale,
  Trophy,
  BarChart3,
  Settings,
  Layers,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface OrganizerSidebarProps {
  hackathonId?: string;
}

export const OrganizerSidebar: React.FC<OrganizerSidebarProps> = ({
  hackathonId = 'quantum-build-2026',
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const urlMatch = pathname ? pathname.match(/\/organizer\/([^/]+)/) : null;
  const activeHackathonId = urlMatch ? urlMatch[1] : hackathonId;
  const hackathonName = activeHackathonId.replace(/-/g, ' ').toUpperCase();
  const hackathonInitial = activeHackathonId.charAt(0).toUpperCase();
  const baseUrl = `/organizer/${activeHackathonId}`;

  const navSections = [
    {
      title: 'COMMAND CENTER',
      items: [
        { label: 'Overview', href: `${baseUrl}/overview`, icon: LayoutDashboard },
      ],
    },
    {
      title: 'HACKATHON',
      items: [
        { label: 'Details & Tracks', href: `${baseUrl}/details`, icon: Layers },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { label: 'Participants', href: `${baseUrl}/participants`, icon: Users },
        { label: 'Teams', href: `${baseUrl}/teams`, icon: Briefcase },
        { label: 'Judges', href: `${baseUrl}/judges`, icon: UserCheck },
      ],
    },
    {
      title: 'COMPETITION',
      items: [
        { label: 'Submissions', href: `${baseUrl}/submissions`, icon: FileCheck2 },
        { label: 'Judging', href: `${baseUrl}/judging`, icon: Scale },
        { label: 'Leaderboard', href: `${baseUrl}/leaderboard`, icon: Trophy },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { label: 'Analytics', href: `${baseUrl}/analytics`, icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', href: `${baseUrl}/settings`, icon: Settings },
      ],
    },
  ];

  // Mobile bottom nav — key organizer items
  const mobileNavItems = [
    { label: 'Overview', href: `${baseUrl}/overview`, icon: LayoutDashboard },
    { label: 'Teams', href: `${baseUrl}/teams`, icon: Briefcase },
    { label: 'Judging', href: `${baseUrl}/judging`, icon: Scale },
    { label: 'Leaderboard', href: `${baseUrl}/leaderboard`, icon: Trophy },
    { label: 'Settings', href: `${baseUrl}/settings`, icon: Settings },
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
      {/* ===================== DESKTOP SIDEBAR ===================== */}
      <aside
        className={`hidden lg:flex sticky top-0 h-screen bg-transparent flex-col select-none font-inter shrink-0 transition-all duration-300 z-40 ${
          isCollapsed ? 'w-20' : 'w-60'
        }`}
      >
        {/* Header & Toggle Button */}
        <div className="p-3 bg-[#FFFFFF] dark:bg-[#141414] rounded-2xl m-3 flex items-center justify-between gap-2 overflow-hidden shadow-xs dark:border dark:border-neutral-800">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs rounded-full shrink-0 shadow-xs">
                  {hackathonInitial}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-geist font-bold text-[#111111] dark:text-white uppercase tracking-wider truncate">
                    {hackathonName}
                  </h2>
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
              <div className="w-8 h-8 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs rounded-full shrink-0 shadow-xs">
                {hackathonInitial}
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

        {/* Navigation list */}
        <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto no-scrollbar">
          {!isCollapsed && (
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white font-inter font-semibold transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Public Home
            </Link>
          )}

          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-[10px] font-inter font-bold uppercase tracking-widest text-[#777777] dark:text-neutral-500">
                  {sec.title}
                </h3>
              )}
              <ul className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
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
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer info & Sign Out */}
        {!isCollapsed ? (
          <div className="p-3 bg-[#FFFFFF] dark:bg-[#141414] rounded-2xl m-3 text-xs font-inter text-[#777777] dark:text-neutral-400 shadow-xs dark:border dark:border-neutral-800 space-y-2">
            <div className="flex justify-between items-center">
              <span>STATUS:</span>
              <span className="text-[#800000] font-bold">OPERATIONAL</span>
            </div>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] dark:bg-[#111111] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] rounded-t-3xl">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[52px] ${
                  isActive
                    ? 'text-[#800000]'
                    : 'text-[#999999] dark:text-neutral-500 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#800000]' : ''}`} />
                <span className={`text-[9px] font-inter font-semibold leading-none ${isActive ? 'text-[#800000]' : ''}`}>
                  {item.label}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#800000] mt-0.5" />}
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
