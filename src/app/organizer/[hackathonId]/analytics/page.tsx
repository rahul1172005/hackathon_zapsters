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
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto pb-24 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              INSIGHTS & OBSERVED METRICS
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Competition Analytics</h1>
          </div>

          <div className="font-mono text-xs text-[#16803C] bg-[#FFFFFF] border border-[#E5E5E2] px-3 py-1.5 rounded-xs">
            GITHUB ENGINE ANALYTICS ACTIVE
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Commit & PR Velocity Line Chart */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-4 font-sans">
            <div className="flex justify-between items-center border-b border-[#E5E5E2] pb-3">
              <h3 className="text-xs font-mono font-bold uppercase text-[#111111] flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#16803C]" /> COMMIT VELOCITY OVER 48 HOURS
              </h3>
              <span className="font-mono text-[10px] text-[#666666]">341 TOTAL COMMITS</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COMMIT_VELOCITY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E2" />
                  <XAxis dataKey="time" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                  <Line type="monotone" dataKey="commits" stroke="#111111" strokeWidth={2} dot={{ fill: '#111111' }} />
                  <Line type="monotone" dataKey="prs" stroke="#16803C" strokeWidth={2} dot={{ fill: '#16803C' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Distribution Bar Chart */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-4 font-sans">
            <div className="flex justify-between items-center border-b border-[#E5E5E2] pb-3">
              <h3 className="text-xs font-mono font-bold uppercase text-[#111111] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#A15C00]" /> SCORE DISTRIBUTION HISTOGRAM
              </h3>
              <span className="font-mono text-[10px] text-[#666666]">163 EVALUATED TEAMS</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_DISTRIBUTION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E2" />
                  <XAxis dataKey="range" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111111', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                  <Bar dataKey="count" fill="#111111" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
