'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
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
} from 'lucide-react';

export const ParticipantSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract active teamId from route if present, e.g. /my-teams/team-001/overview
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
  ];

  return (
    <aside
      className={`sticky top-0 h-screen bg-transparent flex flex-col select-none font-inter shrink-0 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Top Header & Toggle Button */}
      <div className="p-3 bg-[#FFFFFF] rounded-2xl m-3 flex items-center justify-between gap-2 overflow-hidden shadow-xs">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-geist font-bold text-xs shrink-0">
                RS
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-geist font-bold text-[#111111] truncate">Rahul Sharma</h2>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              title="Minimize Sidebar"
              className="w-7 h-7 bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#111111] rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-[#800000]" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full">
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-geist font-bold text-xs shrink-0">
              RS
            </div>
            <button
              onClick={() => setIsCollapsed(false)}
              title="Maximize Sidebar"
              className="w-7 h-7 bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#111111] rounded-full flex items-center justify-center transition-colors shrink-0"
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
            className="flex items-center gap-2 px-3 py-2 text-xs text-[#777777] hover:text-[#111111] font-inter font-semibold transition-colors mb-2"
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
                  : 'text-[#777777] hover:text-[#111111] hover:bg-[#FFFFFF]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Neumorphic Theme Toggle */}
      {!isCollapsed && (
        <div className="p-3 bg-[#FFFFFF] dark:bg-[#141414] rounded-2xl m-3 font-inter text-[11px] text-[#777777] dark:text-neutral-400 space-y-2 shadow-xs border border-transparent dark:border-neutral-800">
          <div className="flex justify-between items-center">
            <span>THEME:</span>
            <ThemeToggle />
          </div>
          <div className="flex justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <span>TEAM:</span>
            <span className="font-bold text-[#111111] dark:text-white">CyberForge</span>
          </div>
          <div className="flex justify-between">
            <span>RANK:</span>
            <span className="font-bold text-[#800000] dark:text-red-400">#03</span>
          </div>
        </div>
      )}
    </aside>
  );
};
