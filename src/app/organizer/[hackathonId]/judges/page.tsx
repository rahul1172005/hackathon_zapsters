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
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              EVALUATION OPS
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Judges Workload Matrix</h1>
          </div>

          <button className="px-3.5 py-2 bg-[#111111] hover:bg-[#222222] text-white text-xs font-mono font-bold uppercase rounded-xs transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Invite New Judge
          </button>
        </div>

        {/* Workload Progress Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-5 space-y-1">
            <div className="text-[10px] text-[#666666] uppercase">TOTAL JUDGES</div>
            <div className="text-2xl font-bold text-[#111111]">{judges.length} ACTIVE</div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-5 space-y-1">
            <div className="text-[10px] text-[#666666] uppercase">EVALUATIONS COMPLETED</div>
            <div className="text-2xl font-bold text-[#16803C]">35 / 49</div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-5 space-y-1">
            <div className="text-[10px] text-[#666666] uppercase">REMAINING QUEUE</div>
            <div className="text-2xl font-bold text-[#A15C00]">14 PENDING</div>
          </div>
        </div>

        {/* Judges List */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E5E2] font-mono text-[10px] uppercase text-[#666666]">
                <th className="py-2.5 px-4">JUDGE</th>
                <th className="py-2.5 px-4">ORGANIZATION / ROLE</th>
                <th className="py-2.5 px-4">ASSIGNED TEAMS</th>
                <th className="py-2.5 px-4">COMPLETED</th>
                <th className="py-2.5 px-4 text-right">PROGRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {judges.map((j) => {
                const pct = Math.round((j.completedCount / j.assignedTeamsCount) * 100);
                return (
                  <tr key={j.id} className="hover:bg-[#F7F7F5]">
                    <td className="py-3 px-4 font-bold text-[#111111] flex items-center gap-2.5">
                      <img src={j.avatar} alt={j.name} loading="lazy" decoding="async" className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div>{j.name}</div>
                        <div className="text-[10px] font-mono text-[#666666]">{j.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111111]">{j.organization}</div>
                      <div className="text-[10px] font-mono text-[#666666]">{j.role}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#111111]">{j.assignedTeamsCount} Teams</td>
                    <td className="py-3 px-4 font-mono text-[#16803C] font-semibold">{j.completedCount} Teams</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111111]">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
