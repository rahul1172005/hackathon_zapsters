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
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              COMPETITION ENGINE
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Leaderboard Control Center</h1>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`px-3 py-1.5 border rounded-xs font-bold transition-colors flex items-center gap-1.5 ${
                isLocked
                  ? 'bg-[#C62828] text-white border-[#C62828]'
                  : 'bg-[#FFFFFF] border-[#E5E5E2] text-[#111111]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {isLocked ? 'RANKINGS LOCKED' : 'LOCK RANKINGS'}
            </button>

            <button
              onClick={() => setIsPublished(!isPublished)}
              className={`px-3.5 py-1.5 font-bold rounded-xs transition-colors flex items-center gap-1.5 ${
                isPublished
                  ? 'bg-[#16803C] text-white'
                  : 'bg-[#111111] text-white'
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
