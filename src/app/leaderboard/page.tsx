'use client';

import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { LiveLeaderboardTable } from '@/components/shared/LiveLeaderboardTable';
import { getLeaderboard } from '@/lib/mockApi';
import { Team } from '@/types';
import { Trophy } from 'lucide-react';

export default function PublicLeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then((res) => {
      setTeams(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col font-inter">
      <PublicNavbar />

      {/* Header Banner — NO divided lines */}
      <section className="bg-white dark:bg-black py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-2 font-inter">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#800000]" />
            <span className="font-mono text-xs text-[#800000] uppercase tracking-widest font-bold">
              OFFICIAL BROADCAST LEADERBOARD
            </span>
          </div>
          <h1 className="text-3xl font-geist font-bold text-[#111111] dark:text-white">
            Quantum Build 2026 Live Standings
          </h1>
          <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
            Scores dynamically reflect judge rubric evaluations, code velocity telemetry, and track metrics.
          </p>
        </div>
      </section>

      {/* Leaderboard Table Container */}
      <section className="py-6 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 font-inter">
        {loading ? (
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-12 text-center text-xs font-inter text-[#777777] rounded-3xl shadow-xs">
            Calculating Live Score Matrices...
          </div>
        ) : (
          <LiveLeaderboardTable teams={teams} isCompact={false} />
        )}
      </section>
    </div>
  );
}
