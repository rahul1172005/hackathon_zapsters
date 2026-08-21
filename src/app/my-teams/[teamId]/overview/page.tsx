'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { TeamWorkspaceHeader } from '@/components/navigation/TeamWorkspaceHeader';
import { MOCK_TEAMS } from '@/lib/mockData';
import { ActivityIndicator } from '@/components/shared/ActivityIndicator';
import { CheckCircle2, Clock } from 'lucide-react';

export default function TeamOverviewPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const team = MOCK_TEAMS.find((t) => t.id === teamId || t.slug === teamId) || MOCK_TEAMS[2];

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        <TeamWorkspaceHeader team={team} />

        {/* Team Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 font-inter text-xs">
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-4 sm:p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">SUBMISSION PROGRESS</div>
            <div className="text-xl font-bold font-geist text-[#800000] dark:text-red-400 flex items-center justify-between">
              <span>90% COMPLETE</span>
              <CheckCircle2 className="w-5 h-5 text-[#800000] dark:text-red-400" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-4 sm:p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">NEXT DEADLINE</div>
            <div className="text-xl font-bold font-geist text-[#111111] dark:text-white flex items-center justify-between">
              <span>18:42:17</span>
              <Clock className="w-5 h-5 text-[#800000] dark:text-red-400" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-4 sm:p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">ACTIVITY TELEMETRY</div>
            <div className="text-xl font-bold text-[#111111] dark:text-white flex items-center justify-between">
              <ActivityIndicator level={team.activityLevel} />
            </div>
          </div>
        </div>

        {/* Project Summary Box */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-5 sm:p-6 space-y-3 font-inter rounded-3xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white">Project: {team.project.name}</h2>
            <Link href={`/my-teams/${team.id}/project`} className="text-xs font-inter text-[#800000] dark:text-red-400 font-bold hover:underline">
              View Full Project Case Study →
            </Link>
          </div>
          <p className="text-xs text-[#111111] dark:text-neutral-300 leading-relaxed font-inter">{team.project.description}</p>
        </div>

        {/* Roster & Contribution */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-5 sm:p-6 space-y-4 font-inter rounded-3xl shadow-xs">
          <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white">Team Members & Contribution Split</h2>
          <div className="space-y-3 font-inter text-xs">
            {team.contributionSplit.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-[#111111] dark:text-white">
                  <span className="font-bold">{c.name}</span>
                  <span>{c.percentage}%</span>
                </div>
                <div className="w-full bg-[#F7F7F5] dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#111111] dark:bg-white h-full" style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
