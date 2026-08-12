'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { TeamWorkspaceHeader } from '@/components/navigation/TeamWorkspaceHeader';
import { MOCK_TEAMS } from '@/lib/mockData';

export default function TeamActivityFilteredPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const team = MOCK_TEAMS.find((t) => t.id === teamId || t.slug === teamId) || MOCK_TEAMS[2];
  const [filterType, setFilterType] = useState<string>('All');

  const filteredLogs = team.activityLog.filter(
    (a) => filterType === 'All' || a.type.toLowerCase() === filterType.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        {/* Top Header Card — Same width and side padding as below cards */}
        <TeamWorkspaceHeader team={team} />

        {/* Section 13 Filter Bar Card */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-3 font-inter text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#777777] font-bold">FILTER EVENT TYPE:</span>
            {['All', 'Commits', 'PR', 'Issue', 'Task'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  filterType === type
                    ? 'bg-[#800000] text-white font-bold shadow-xs'
                    : 'bg-[#F7F7F5] text-[#777777] hover:text-[#111111]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <span className="text-[#777777] font-bold">{filteredLogs.length} EVENTS</span>
        </div>

        {/* Activity Logs Container Card */}
        <div className="bg-[#FFFFFF] p-6 space-y-3 rounded-3xl shadow-xs font-inter text-xs">
          {filteredLogs.map((act) => (
            <div key={act.id} className="p-4 bg-[#F7F7F5] rounded-2xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#111111]">{act.author}</span>
                  <span className="text-[11px] font-bold text-[#800000] uppercase">
                    {act.action}
                  </span>
                </div>
                <div className="text-xs font-inter text-[#111111] mt-0.5">{act.detail}</div>
              </div>
              <div className="text-xs text-[#777777] shrink-0 font-inter">
                {act.timestamp} IST
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
