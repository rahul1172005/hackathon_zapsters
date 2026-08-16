'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TeamStatusBadge } from '@/components/shared/TeamStatusBadge';
import { Team } from '@/types';

interface TeamWorkspaceHeaderProps {
  team: Team;
}

export const TeamWorkspaceHeader: React.FC<TeamWorkspaceHeaderProps> = ({ team }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: `/my-teams/${team.id}/overview` },
    { label: 'Project', href: `/my-teams/${team.id}/project` },
    { label: 'Tasks', href: `/my-teams/${team.id}/tasks` },
    { label: 'Activity', href: `/my-teams/${team.id}/activity` },
    { label: 'Performance', href: `/my-teams/${team.id}/performance` },
    { label: 'Submission', href: `/my-teams/${team.id}/submission` },
  ];

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-4 sm:p-6 rounded-3xl font-inter shadow-xs space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">{team.name}</h1>
            <TeamStatusBadge status={team.status} />
          </div>
          <p className="text-xs font-inter text-[#777777] dark:text-neutral-400 mt-1">
            {team.hackathonTitle} • Track: {team.track}
          </p>
        </div>

        <div className="flex items-center gap-4 font-inter text-xs bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-xs self-start sm:self-auto">
          <div>
            <span className="text-[#777777] dark:text-neutral-400">RANK: </span>
            <span className="font-bold text-[#800000] dark:text-red-400">#{team.rank}</span>
          </div>
          <div>
            <span className="text-[#777777] dark:text-neutral-400">SCORE: </span>
            <span className="font-bold text-[#111111] dark:text-white">{team.score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Grouped Navigation Tabs — Horizontal scroll on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-inter overflow-x-auto no-scrollbar pt-1 sm:pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full whitespace-nowrap transition-all text-xs shrink-0 ${
                isActive
                  ? 'bg-[#800000] text-white font-bold shadow-xs'
                  : 'bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
