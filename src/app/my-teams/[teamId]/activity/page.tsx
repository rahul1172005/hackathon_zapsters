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
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        {/* Top Header Card — Same width and side padding as below cards */}
        <TeamWorkspaceHeader team={team} />

        {/* Section 13 Filter Bar Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-4 sm:p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-inter text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <span className="text-[#777777] dark:text-neutral-400 font-bold whitespace-nowrap text-[11px]">FILTER:</span>
            {['All', 'Commits', 'PR', 'Issue', 'Task'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 sm:px-4 py-1.5 rounded-full transition-colors whitespace-nowrap text-xs cursor-pointer shrink-0 ${
                  filterType === type
                    ? 'bg-[#800000] text-white font-bold shadow-xs'
                    : 'bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <span className="text-[#777777] dark:text-neutral-400 font-bold self-end sm:self-auto text-xs">{filteredLogs.length} EVENTS</span>
        </div>

        {/* Activity Logs Container Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-4 sm:p-6 space-y-3 rounded-3xl shadow-xs font-inter text-xs">
          {filteredLogs.map((act) => (
            <div key={act.id} className="p-3.5 sm:p-4 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#111111] dark:text-white">{act.author}</span>
                  <span className="text-[11px] font-bold text-[#800000] dark:text-red-400 uppercase">
                    {act.action}
                  </span>
                </div>
                <div className="text-xs font-inter text-[#111111] dark:text-neutral-300 mt-0.5">{act.detail}</div>
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
