'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { BarChart3, GitBranch } from 'lucide-react';

const COMMIT_VELOCITY_DATA = [
  { time: '00:00', commits: 14, prs: 2 },
  { time: '06:00', commits: 38, prs: 8 },
  { time: '12:00', commits: 92, prs: 18 },
  { time: '18:00', commits: 145, prs: 31 },
  { time: '24:00', commits: 210, prs: 48 },
  { time: '30:00', commits: 280, prs: 64 },
  { time: '36:00', commits: 315, prs: 76 },
  { time: '42:00', commits: 341, prs: 84 },
];

const SCORE_DISTRIBUTION_DATA = [
  { range: '90-100', count: 4 },
  { range: '80-89', count: 18 },
  { range: '70-79', count: 42 },
  { range: '60-69', count: 68 },
  { range: '<60', count: 31 },
];

export default function CompetitionAnalyticsPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              INSIGHTS & OBSERVED METRICS
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Competition Analytics
            </h1>
          </div>

          <div className="font-mono text-xs text-[#800000] bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 px-4 py-2 rounded-full font-bold shadow-2xs self-start sm:self-auto">
            GITHUB TELEMETRY ACTIVE
          </div>
        </div>

        {/* Charts Grid — Curved Corners rounded-3xl, NO Divided Lines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-inter">
          
          {/* Commit & PR Velocity Line Chart */}
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-7 space-y-4 rounded-3xl shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase text-[#111111] dark:text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#800000]" /> COMMIT VELOCITY OVER 48 HOURS
              </h3>
              <span className="font-mono text-[10px] text-[#777777] dark:text-neutral-400 font-bold">341 TOTAL COMMITS</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COMMIT_VELOCITY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E2" />
                  <XAxis dataKey="time" stroke="#777777" fontSize={10} tickLine={false} />
                  <YAxis stroke="#777777" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', color: '#fff', fontSize: '12px', borderRadius: '12px', border: 'none' }}
                  />
                  <Line type="monotone" dataKey="commits" stroke="#800000" strokeWidth={2} dot={{ fill: '#800000' }} />
                  <Line type="monotone" dataKey="prs" stroke="#111111" strokeWidth={2} dot={{ fill: '#111111' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Distribution Bar Chart */}
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-7 space-y-4 rounded-3xl shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase text-[#111111] dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#800000]" /> SCORE DISTRIBUTION HISTOGRAM
              </h3>
              <span className="font-mono text-[10px] text-[#777777] dark:text-neutral-400 font-bold">163 EVALUATED TEAMS</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_DISTRIBUTION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E2" />
                  <XAxis dataKey="range" stroke="#777777" fontSize={10} tickLine={false} />
                  <YAxis stroke="#777777" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', color: '#fff', fontSize: '12px', borderRadius: '12px', border: 'none' }}
                  />
                  <Bar dataKey="count" fill="#800000" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
