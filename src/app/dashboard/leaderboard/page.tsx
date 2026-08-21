'use client';

import React from 'react';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { LiveLeaderboardTable } from '@/components/shared/LiveLeaderboardTable';
import { MOCK_TEAMS } from '@/lib/mockData';

export default function DashboardLeaderboardWorkspacePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      {/* Sidebar stays fixed/anchored on the left */}
      <ParticipantSidebar />

      {/* Main Leaderboard View inside the Workspace */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">
              Live Leaderboard Standings
            </h1>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter mt-1">
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
