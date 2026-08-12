'use client';

import React from 'react';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { LiveLeaderboardTable } from '@/components/shared/LiveLeaderboardTable';
import { MOCK_TEAMS } from '@/lib/mockData';

export default function DashboardLeaderboardWorkspacePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex font-inter">
      {/* Sidebar stays fixed/anchored on the left */}
      <ParticipantSidebar />

      {/* Main Leaderboard View inside the Workspace */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-geist font-bold text-[#111111]">
              Live Leaderboard Standings
            </h1>
            <p className="text-xs text-[#777777] font-inter mt-1">
              Dynamic rankings updated live via judge rubric scores and code activity.
            </p>
          </div>
        </div>

        {/* Live Leaderboard Component inside Workspace */}
        <LiveLeaderboardTable teams={MOCK_TEAMS} isCompact={false} />
      </main>
    </div>
  );
}
