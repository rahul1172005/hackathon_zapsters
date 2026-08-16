'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { TeamWorkspaceHeader } from '@/components/navigation/TeamWorkspaceHeader';
import { MOCK_TEAMS, MOCK_EVALUATIONS } from '@/lib/mockData';
import { TrendingUp } from 'lucide-react';

export default function TeamPerformancePage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const team = MOCK_TEAMS.find((t) => t.id === teamId || t.slug === teamId) || MOCK_TEAMS[2];
  const evalData = MOCK_EVALUATIONS.find((e) => e.teamId === team.id) || MOCK_EVALUATIONS[0];

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        <TeamWorkspaceHeader team={team} />

        {/* Section 14 Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 font-inter text-xs">
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-4 sm:p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">COMPETITION SCORE</div>
            <div className="text-xl sm:text-2xl font-bold font-geist text-[#800000] dark:text-red-400">{team.score.toFixed(1)} PTS</div>
            <div className="text-[10px] text-[#777777] dark:text-neutral-400">RANK #{team.rank} OVERALL</div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-4 sm:p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">SCORE VELOCITY</div>
            <div className="text-xl sm:text-2xl font-bold font-geist text-[#111111] dark:text-white flex items-center gap-1">
              <TrendingUp className="w-5 h-5 text-[#800000] dark:text-red-400" /> {team.scoreTrend}
            </div>
            <div className="text-[10px] text-[#777777] dark:text-neutral-400">LAST 24 HOURS</div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-4 sm:p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">READINESS SCORE</div>
            <div className="text-xl sm:text-2xl font-bold font-geist text-[#800000] dark:text-red-400">90% READY</div>
            <div className="text-[10px] text-[#777777] dark:text-neutral-400">1 DELIVERABLE PENDING</div>
          </div>
        </div>

        {/* Judge Feedback & Breakdown */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-5 sm:p-6 space-y-4 rounded-3xl shadow-xs font-inter">
          <div className="pb-1">
            <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white">AUDITED JUDGE FEEDBACK</h2>
          </div>

          <div className="p-4 sm:p-5 bg-[#F7F7F5] dark:bg-neutral-900 space-y-2 font-inter text-xs rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 font-inter text-xs text-[#777777] dark:text-neutral-400">
              <span>EVALUATOR: {evalData.judgeName}</span>
              <span className="font-bold text-[#800000] dark:text-red-400">TOTAL: {evalData.totalScore} / 100</span>
            </div>
            <p className="text-xs text-[#111111] dark:text-neutral-300 leading-relaxed font-inter">{evalData.notes}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
