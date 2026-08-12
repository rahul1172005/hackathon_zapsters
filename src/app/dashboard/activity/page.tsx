'use client';

import React from 'react';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { MOCK_TEAMS } from '@/lib/mockData';

export default function HackerActivityPage() {
  const activityLog = MOCK_TEAMS[2].activityLog;

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col lg:flex-row font-sans">
      <ParticipantSidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto pb-24 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              OBSERVABILITY LOGS
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Real-time Hacker Activity Stream</h1>
          </div>

          <div className="font-mono text-xs text-[#16803C] bg-[#16803C]/10 border border-[#16803C]/20 px-3 py-1.5 rounded-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16803C] animate-pulse" />
            GITHUB HOOK ACTIVE
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-4 font-sans">
          <div className="flex justify-between items-center border-b border-[#E5E5E2] pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#111111]">
              CHRONOLOGICAL EVENT LOG (CYBERFORGE)
            </h2>
            <span className="text-[10px] font-mono text-[#666666]">{activityLog.length} RECENT EVENTS</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {activityLog.map((act) => (
              <div key={act.id} className="p-4 bg-[#F7F7F5] border border-[#E5E5E2] rounded-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111111]">{act.author}</span>
                    <span className="text-[10px] text-[#16803C] font-semibold bg-[#16803C]/10 px-1.5 py-0.2 rounded-xs">
                      {act.action}
                    </span>
                  </div>
                  <div className="text-xs text-[#111111] font-sans">{act.detail}</div>
                </div>
                <div className="text-[10px] text-[#666666] shrink-0">
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
