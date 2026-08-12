'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { getTeams } from '@/lib/mockApi';
import { Team } from '@/types';
import { TeamStatusBadge } from '@/components/shared/TeamStatusBadge';
import { ActivityIndicator } from '@/components/shared/ActivityIndicator';
import { Search, ExternalLink } from 'lucide-react';

export default function TeamsOperationsPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getTeams(hackathonId).then(setTeams);
  }, [hackathonId]);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              PEOPLE & TEAMS
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Teams Management Matrix</h1>
          </div>

          <div className="font-mono text-xs text-[#666666] bg-[#FFFFFF] border border-[#E5E5E2] px-3 py-1.5 rounded-xs">
            TOTAL: {teams.length} FORMED TEAMS
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-4 flex justify-between items-center">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
            <input
              type="text"
              placeholder="Search team or project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#111111] pl-9 pr-4 py-2 text-xs font-mono rounded-xs outline-none"
            />
          </div>
          <span className="font-mono text-xs text-[#666666]">186 TEAMS ACTIVE</span>
        </div>

        {/* Operational Teams Table (Section 19 Specification) */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E5E2] font-mono text-[10px] uppercase text-[#666666]">
                <th className="py-2.5 px-4 w-12">RANK</th>
                <th className="py-2.5 px-4">TEAM NAME</th>
                <th className="py-2.5 px-4">MEMBERS</th>
                <th className="py-2.5 px-4">ACTIVITY LEVEL</th>
                <th className="py-2.5 px-4">SUBMISSION RATE</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4 text-right">SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E2]">
              {filteredTeams.map((t) => (
                <tr key={t.id} className="hover:bg-[#F7F7F5]">
                  <td className="py-3 px-4 font-mono font-bold text-[#111111]">#{t.rank}</td>
                  <td className="py-3 px-4">
                    <Link href={`/team/${t.slug}`} className="font-bold text-[#111111] hover:underline flex items-center gap-1">
                      {t.name} <ExternalLink className="w-3 h-3 text-[#999999]" />
                    </Link>
                    <div className="text-[10px] font-mono text-[#666666]">{t.project.name}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#666666]">{t.members.length} Hackers</td>
                  <td className="py-3 px-4"><ActivityIndicator level={t.activityLevel} /></td>
                  <td className="py-3 px-4 font-mono text-[#16803C] font-semibold">100%</td>
                  <td className="py-3 px-4"><TeamStatusBadge status={t.status} /></td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#111111]">{t.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
