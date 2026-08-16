'use client';

import React, { useState, useEffect } from 'react';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import * as api from '@/lib/api';
import { Team } from '@/types';

export default function HackerActivityPage() {
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = await api.getTeamBySlug('cyberforge');
      if (cancelled) return;
      setTeam(t);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!team) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
        <ParticipantSidebar />
        <main className="flex-1 p-12 flex items-center justify-center text-xs font-inter text-[#777777]">
          Loading Activity...
        </main>
      </div>
    );
  }

  const activityLog = team.activityLog;

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              OBSERVABILITY LOGS
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">Real-time Hacker Activity Stream</h1>
          </div>

          <div className="font-mono text-xs text-[#800000] bg-[#800000]/10 border border-[#800000]/20 px-4 py-2 rounded-full font-bold flex items-center gap-2 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#800000] animate-pulse" />
            GITHUB HOOK ACTIVE
          </div>
        </div>

        {/* Activity Container — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 sm:p-8 space-y-4 font-inter rounded-3xl shadow-xs">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#800000]">
              CHRONOLOGICAL EVENT LOG (CYBERFORGE)
            </h2>
            <span className="text-[10px] font-mono text-[#777777] dark:text-neutral-400 font-bold">{activityLog.length} RECENT EVENTS</span>
          </div>

          <div className="space-y-3 text-xs font-inter">
            {activityLog.map((act) => (
              <div key={act.id} className="p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-2xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111111] dark:text-white">{act.author}</span>
                    <span className="text-[10px] font-mono text-[#800000] font-bold bg-[#800000]/10 px-2 py-0.5 rounded-full uppercase">
                      {act.action}
                    </span>
                  </div>
                  <div className="text-xs text-[#777777] dark:text-neutral-300 font-inter">{act.detail}</div>
                </div>
                <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400 shrink-0 font-bold">
                  {act.timestamp} IST
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
