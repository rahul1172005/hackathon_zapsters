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
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              PEOPLE & TEAMS
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Teams Operations Matrix
            </h1>
          </div>

          <div className="font-mono text-xs text-[#800000] bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 px-4 py-2 rounded-full font-bold shadow-2xs self-start sm:self-auto">
            TOTAL: {teams.length} FORMED TEAMS
          </div>
        </div>

        {/* Search Bar — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-inter">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
            <input
              type="text"
              placeholder="Search team or project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] pl-10 pr-4 py-2.5 text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
            />
          </div>
          <span className="font-mono text-xs text-[#777777] dark:text-neutral-400 font-bold">186 TEAMS ACTIVE</span>
        </div>

        {/* Operational Teams Table — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-xs">
              <thead>
                <tr className="bg-[#F7F7F5] dark:bg-neutral-900 font-mono text-[10px] uppercase text-[#777777] dark:text-neutral-400">
                  <th className="py-3 px-5 w-12">RANK</th>
                  <th className="py-3 px-5">TEAM NAME</th>
                  <th className="py-3 px-5">MEMBERS</th>
                  <th className="py-3 px-5">ACTIVITY LEVEL</th>
                  <th className="py-3 px-5">SUBMISSION RATE</th>
                  <th className="py-3 px-5">STATUS</th>
                  <th className="py-3 px-5 text-right">SCORE</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F7F7F5] dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#800000]">#{t.rank}</td>
                    <td className="py-3.5 px-5">
                      <Link href={`/team/${t.slug}`} className="font-bold text-[#111111] dark:text-white hover:text-[#800000] flex items-center gap-1">
                        {t.name} <ExternalLink className="w-3 h-3 text-[#999999]" />
                      </Link>
                      <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400">{t.project.name}</div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#777777] dark:text-neutral-400">{t.members.length} Hackers</td>
                    <td className="py-3.5 px-5"><ActivityIndicator level={t.activityLevel} /></td>
                    <td className="py-3.5 px-5 font-mono text-[#800000] font-semibold">100%</td>
                    <td className="py-3.5 px-5"><TeamStatusBadge status={t.status} /></td>
                    <td className="py-3.5 px-5 text-right font-mono font-extrabold text-[#111111] dark:text-white">{t.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
