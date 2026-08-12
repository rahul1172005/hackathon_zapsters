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
    <div className="bg-[#FFFFFF] p-6 rounded-3xl font-inter shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-geist font-bold text-[#111111]">{team.name}</h1>
            <TeamStatusBadge status={team.status} />
          </div>
          <p className="text-xs font-inter text-[#777777] mt-1">
            {team.hackathonTitle} • Track: {team.track}
          </p>
        </div>

        <div className="flex items-center gap-4 font-inter text-xs bg-[#F7F7F5] px-5 py-2.5 rounded-full shadow-xs">
          <div>
            <span className="text-[#777777]">RANK: </span>
            <span className="font-bold text-[#800000]">#{team.rank}</span>
          </div>
          <div>
            <span className="text-[#777777]">SCORE: </span>
            <span className="font-bold text-[#111111]">{team.score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Grouped Navigation Tabs — NO divider line */}
      <div className="flex items-center gap-2 text-xs font-inter overflow-x-auto pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-5 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-[#800000] text-white font-bold shadow-xs'
                  : 'bg-[#F7F7F5] text-[#777777] hover:text-[#111111] hover:bg-[#E5E5E2]'
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
