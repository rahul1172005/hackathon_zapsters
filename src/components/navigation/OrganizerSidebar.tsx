'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

interface OrganizerSidebarProps {
  hackathonId?: string;
}

export const OrganizerSidebar: React.FC<OrganizerSidebarProps> = ({
  hackathonId = 'quantum-build-2026',
}) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const baseUrl = `/organizer/${hackathonId}`;

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
        { label: 'Details & Tracks', href: `/hackathons/${hackathonId}`, icon: Layers },
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

  return (
    <aside
      className={`sticky top-0 h-screen bg-transparent flex flex-col select-none font-inter shrink-0 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Header & Toggle Button — Seamless Floating Card */}
      <div className="p-3 bg-[#FFFFFF] rounded-2xl m-3 flex items-center justify-between gap-2 overflow-hidden shadow-xs">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs rounded-full shrink-0 shadow-xs">
                Q
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-geist font-bold text-[#111111] uppercase tracking-wider truncate">
                  QUANTUM BUILD
                </h2>
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
            <div className="w-8 h-8 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs rounded-full shrink-0 shadow-xs">
              Q
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

      {/* Navigation list — Floating Seamlessly on #F7F7F5 */}
      <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#777777] hover:text-[#111111] font-inter font-semibold transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Public Home
          </Link>
        )}

        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-inter font-bold uppercase tracking-widest text-[#777777]">
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
                          : 'text-[#777777] hover:text-[#111111] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer info — Seamless Floating Card */}
      {!isCollapsed && (
        <div className="p-3 bg-[#FFFFFF] rounded-2xl m-3 text-xs font-inter text-[#777777] shadow-xs">
          <div className="flex justify-between items-center">
            <span>STATUS:</span>
            <span className="text-[#800000] font-bold">OPERATIONAL</span>
          </div>
        </div>
      )}
    </aside>
  );
};
