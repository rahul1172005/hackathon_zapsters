'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { LiveLeaderboardTable } from '@/components/shared/LiveLeaderboardTable';
import { getLeaderboard } from '@/lib/mockApi';
import { Team } from '@/types';
import { Lock, Globe } from 'lucide-react';

export default function OrganizerLeaderboardControlPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  const [teams, setTeams] = useState<Team[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    getLeaderboard(hackathonId).then(setTeams);
  }, [hackathonId]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              COMPETITION ENGINE
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Leaderboard Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs font-inter font-bold">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                isLocked
                  ? 'bg-[#800000] text-white shadow-xs'
                  : 'bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white hover:border-[#800000]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {isLocked ? 'RANKINGS LOCKED' : 'LOCK RANKINGS'}
            </button>

            <button
              onClick={() => setIsPublished(!isPublished)}
              className={`px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                isPublished
                  ? 'bg-[#800000] text-white shadow-xs'
                  : 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {isPublished ? 'PUBLISHED TO PUBLIC' : 'PUBLISH LEADERBOARD'}
            </button>
          </div>
        </div>

        {/* Live Leaderboard Component */}
        <LiveLeaderboardTable teams={teams} isCompact={false} />
      </main>
    </div>
  );
}
