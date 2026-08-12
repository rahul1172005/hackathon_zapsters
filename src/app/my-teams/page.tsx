'use client';

import React from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { MOCK_TEAMS } from '@/lib/mockData';
import { TeamStatusBadge } from '@/components/shared/TeamStatusBadge';
import { Plus, ArrowRight } from 'lucide-react';

export default function MyTeamsListPage() {
  const team = MOCK_TEAMS[2]; // CyberForge

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header — NO divider lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-geist font-bold text-[#111111]">
              My Joined Teams
            </h1>
            <p className="text-xs text-[#777777] mt-1 font-inter">
              Manage team rosters, projects, task assignments, and submission status.
            </p>
          </div>

          <button className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-2 shadow-xs">
            <Plus className="w-4 h-4" /> Create New Team
          </button>
        </div>

        {/* Team Card Container — NO divider lines */}
        <div className="bg-[#FFFFFF] p-8 space-y-6 rounded-3xl shadow-xs font-inter">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-geist font-bold text-[#111111]">{team.name}</h2>
                <TeamStatusBadge status={team.status} />
              </div>
              <p className="text-xs font-inter text-[#777777] mt-1">{team.hackathonTitle} • {team.track}</p>
            </div>
            
            <Link
              href={`/my-teams/${team.id}/overview`}
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#222222] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-2 shadow-xs"
            >
              Open Team Workspace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Team Member Badges — NO divider lines */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-inter text-xs pt-2">
            {team.members.map((m) => (
              <div key={m.id} className="p-4 bg-[#F7F7F5] rounded-2xl flex items-center gap-3">
                <img src={m.avatar} alt={m.name} loading="lazy" decoding="async" className="w-9 h-9 rounded-full object-cover shadow-xs" />
                <div>
                  <div className="font-bold text-[#111111] text-xs font-geist">{m.name}</div>
                  <div className="text-[11px] text-[#777777] font-inter">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
