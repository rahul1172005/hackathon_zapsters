'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { getJudges } from '@/lib/mockApi';
import { Judge } from '@/types';
import { Plus } from 'lucide-react';

export default function JudgesManagementPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  const [judges, setJudges] = useState<Judge[]>([]);

  useEffect(() => {
    getJudges(hackathonId).then(setJudges);
  }, [hackathonId]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              EVALUATION OPERATIONS
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Judges Workload Matrix
            </h1>
          </div>

          <button className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-geist font-bold uppercase rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Invite New Judge
          </button>
        </div>

        {/* Workload Progress Summary — Curved Corners rounded-2xl, NO divided lines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-inter text-xs">
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400 font-bold uppercase">TOTAL JUDGES</div>
            <div className="text-2xl font-bold font-geist text-[#111111] dark:text-white">{judges.length} ACTIVE</div>
          </div>
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400 font-bold uppercase">EVALUATIONS COMPLETED</div>
            <div className="text-2xl font-bold font-geist text-[#800000]">35 / 49</div>
          </div>
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 space-y-1 rounded-2xl shadow-xs">
            <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400 font-bold uppercase">REMAINING QUEUE</div>
            <div className="text-2xl font-bold font-geist text-[#111111] dark:text-white">14 PENDING</div>
          </div>
        </div>

        {/* Judges List Table — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-xs">
              <thead>
                <tr className="bg-[#F7F7F5] dark:bg-neutral-900 font-mono text-[10px] uppercase text-[#777777] dark:text-neutral-400">
                  <th className="py-3 px-5">JUDGE</th>
                  <th className="py-3 px-5">ORGANIZATION / ROLE</th>
                  <th className="py-3 px-5">ASSIGNED TEAMS</th>
                  <th className="py-3 px-5">COMPLETED</th>
                  <th className="py-3 px-5 text-right">PROGRESS</th>
                </tr>
              </thead>
              <tbody>
                {judges.map((j) => {
                  const pct = Math.round((j.completedCount / j.assignedTeamsCount) * 100);
                  return (
                    <tr key={j.id} className="hover:bg-[#F7F7F5] dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#111111] dark:text-white flex items-center gap-3">
                        <img src={j.avatar} alt={j.name} loading="lazy" decoding="async" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div>
                          <div>{j.name}</div>
                          <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400">{j.email}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#111111] dark:text-white">{j.organization}</div>
                        <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400">{j.role}</div>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-[#111111] dark:text-white">{j.assignedTeamsCount} Teams</td>
                      <td className="py-3.5 px-5 font-mono text-[#800000] font-semibold">{j.completedCount} Teams</td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#111111] dark:text-white">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
