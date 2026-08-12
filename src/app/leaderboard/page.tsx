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
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-sans">
      <PublicNavbar />

      {/* Header Banner */}
      <section className="bg-[#FFFFFF] border-b border-[#E5E5E2] py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#16803C]" />
            <span className="font-mono text-xs text-[#16803C] uppercase tracking-widest font-bold">
              OFFICIAL BROADCAST LEADERBOARD
            </span>
          </div>
          <h1 className="text-3xl font-serif text-[#111111]">
            Quantum Build 2026 Live Standings
          </h1>
          <p className="text-xs text-[#666666] font-mono">
            Scores dynamically reflect judge rubric evaluations, code velocity telemetry, and track metrics.
          </p>
        </div>
      </section>

      {/* Leaderboard Table Container */}
      <section className="py-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {loading ? (
          <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-12 text-center text-xs font-mono text-[#666666]">
            Calculating Live Score Matrices...
          </div>
        ) : (
          <LiveLeaderboardTable teams={teams} isCompact={false} />
        )}
      </section>
    </div>
  );
}
