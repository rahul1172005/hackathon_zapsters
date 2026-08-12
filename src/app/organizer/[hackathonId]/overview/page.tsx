'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { getHackathonBySlug, getTeams } from '@/lib/mockApi';
import { Hackathon, Team } from '@/types';
import { Users, Briefcase, FileCheck2, UserCheck, AlertTriangle } from 'lucide-react';

export default function OrganizerOverviewConnectedPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    getHackathonBySlug(hackathonId).then(setHackathon);
    getTeams(hackathonId).then(setTeams);
  }, [hackathonId]);

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex font-inter">
        <OrganizerSidebar hackathonId={hackathonId} />
        <div className="flex-1 flex items-center justify-center p-12 text-xs font-inter text-[#777777]">
          Loading Command Center Overview...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111]">{hackathon.title} Command Center</h1>
            <p className="text-xs text-[#777777] font-inter mt-0.5">Real-time competition operations and critical alerts.</p>
          </div>

          <Link
            href="/leaderboard"
            className="px-4 py-2 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors shadow-xs"
          >
            Public Broadcast Leaderboard →
          </Link>
        </div>

        {/* 4 Core KPI Stat Cards — NO border lines */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-inter">
          <div className="bg-[#FFFFFF] p-5 space-y-1.5 rounded-2xl shadow-xs">
            <div className="text-xs text-[#777777] uppercase flex justify-between font-bold">
              <span>PARTICIPANTS</span>
              <Users className="w-4 h-4 text-[#800000]" />
            </div>
            <div className="text-2xl font-bold font-geist text-[#111111]">{hackathon.participantsCount}</div>
            <div className="text-[11px] text-[#800000] font-bold">VERIFIED HACKERS</div>
          </div>

          <div className="bg-[#FFFFFF] p-5 space-y-1.5 rounded-2xl shadow-xs">
            <div className="text-xs text-[#777777] uppercase flex justify-between font-bold">
              <span>TEAMS</span>
              <Briefcase className="w-4 h-4 text-[#800000]" />
            </div>
            <div className="text-2xl font-bold font-geist text-[#111111]">{teams.length > 0 ? teams.length : hackathon.teamsCount}</div>
            <div className="text-[11px] text-[#800000] font-bold">141 ACTIVE TEAMS</div>
          </div>

          <div className="bg-[#FFFFFF] p-5 space-y-1.5 rounded-2xl shadow-xs">
            <div className="text-xs text-[#777777] uppercase flex justify-between font-bold">
              <span>SUBMISSIONS</span>
              <FileCheck2 className="w-4 h-4 text-[#800000]" />
            </div>
            <div className="text-2xl font-bold font-geist text-[#800000]">163 / 186</div>
            <div className="text-[11px] text-[#800000] font-bold">87% SUBMISSION RATE</div>
          </div>

          <div className="bg-[#FFFFFF] p-5 space-y-1.5 rounded-2xl shadow-xs">
            <div className="text-xs text-[#777777] uppercase flex justify-between font-bold">
              <span>JUDGING</span>
              <UserCheck className="w-4 h-4 text-[#800000]" />
            </div>
            <div className="text-2xl font-bold font-geist text-[#111111]">63%</div>
            <div className="text-[11px] text-[#777777] font-bold">EVALUATIONS COMPLETE</div>
          </div>
        </div>

        {/* Critical Alert Box — NO border lines */}
        <div className="bg-[#FFFFFF] p-6 space-y-4 rounded-3xl shadow-xs">
          <div className="flex justify-between items-center pb-2">
            <h2 className="text-sm font-geist font-bold text-[#800000] flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-[#800000]" /> ATTENTION REQUIRED
            </h2>
            <span className="font-inter text-xs text-[#777777]">23 TEAMS PENDING</span>
          </div>

          <p className="text-xs text-[#111111] leading-relaxed font-inter">
            23 active teams have not submitted deliverables prior to the upcoming deadline window.
          </p>

          <div className="pt-1">
            <Link
              href={`/organizer/${hackathonId}/teams`}
              className="px-5 py-2 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              View & Filter Teams →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
