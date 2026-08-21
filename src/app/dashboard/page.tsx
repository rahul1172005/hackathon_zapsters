'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { LiveLeaderboardTable } from '@/components/shared/LiveLeaderboardTable';
import * as api from '@/lib/api';
import { TeamStatusBadge } from '@/components/shared/TeamStatusBadge';
import { ActivityIndicator } from '@/components/shared/ActivityIndicator';
import {
  Users,
  Send,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Hackathon, Team } from '@/types';

export default function HackerDashboardPage() {
  const [activeHackathon, setActiveHackathon] = useState<Hackathon | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [leaderboardTeams, setLeaderboardTeams] = useState<Team[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [hackathons, teams] = await Promise.all([api.getHackathons(), api.getLeaderboard()]);
      if (cancelled) return;
      setActiveHackathon(hackathons[0] ?? null);
      setMyTeam(teams.find((t) => t.slug === 'cyberforge' || t.id === 'team-003') ?? teams[2] ?? null);
      setLeaderboardTeams(teams);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!activeHackathon || !myTeam || leaderboardTeams.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
        <ParticipantSidebar />
        <div className="flex-1 flex items-center justify-center p-12 text-xs font-inter text-[#777777]">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <ParticipantSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 md:space-y-8 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">
              Good morning, Rahul Sharma
            </h1>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter mt-1">Here is what you need to know or do right now.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/my-teams/team-003/submission"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors shadow-xs w-full sm:w-auto"
            >
              <Send className="w-4 h-4" />
              Open Submission Flow
            </Link>
          </div>
        </div>

        {/* Active Hackathon Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-5 sm:p-8 space-y-6 rounded-3xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-geist font-bold text-[#111111] dark:text-white">{activeHackathon.title}</h2>
              <p className="text-xs sm:text-sm font-inter text-[#777777] dark:text-neutral-400">{activeHackathon.tagline}</p>
            </div>

            <div className="bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 p-4 sm:p-5 rounded-2xl text-left sm:text-right font-inter">
              <div className="text-[11px] text-[#777777] dark:text-neutral-400 font-bold uppercase">SUBMISSION DEADLINE</div>
              <div className="text-base sm:text-lg font-bold text-[#800000] dark:text-red-400 flex items-center sm:justify-end gap-2 mt-1">
                <Clock className="w-4 h-4" /> 18:42:17 REMAINING
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 font-inter text-xs">
            <div className="p-4 sm:p-5 bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-1.5 rounded-2xl">
              <div className="text-[#777777] dark:text-neutral-400 text-[11px] uppercase font-bold">MY JOINED TEAM</div>
              <div className="font-bold text-[#111111] dark:text-white text-base flex items-center justify-between font-geist">
                <span>{myTeam.name}</span>
                <span className="text-[#800000] dark:text-red-400 text-sm">#03 Rank</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-1.5 rounded-2xl">
              <div className="text-[#777777] dark:text-neutral-400 text-[11px] uppercase font-bold">CURRENT SCORE</div>
              <div className="font-bold text-[#111111] dark:text-white text-base flex items-center justify-between font-geist">
                <span>{myTeam.score.toFixed(1)} Pts</span>
                <span className="text-[#800000] dark:text-red-400 text-sm">{myTeam.scoreTrend}</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-1.5 rounded-2xl">
              <div className="text-[#777777] dark:text-neutral-400 text-[11px] uppercase font-bold">SUBMISSION READINESS</div>
              <div className="font-bold text-[#800000] dark:text-red-400 text-base flex items-center justify-between font-geist">
                <span>90% READY</span>
                <CheckCircle2 className="w-5 h-5 text-[#800000] dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Project & Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Active Team Workspace Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 sm:p-7 space-y-5 rounded-3xl font-inter shadow-xs">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-base sm:text-lg font-geist font-bold text-[#111111] dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#800000] dark:text-red-400" /> MY TEAM WORKSPACE
              </h3>
              <Link href="/my-teams/team-003/overview" className="text-xs font-inter text-[#800000] dark:text-red-400 font-bold hover:underline flex items-center gap-1">
                Open Team <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-2.5 font-inter text-xs">
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-xl">
                <span className="text-[#777777] dark:text-neutral-400">PROJECT:</span>
                <span className="font-bold text-[#111111] dark:text-white font-geist text-sm truncate max-w-[200px]">{myTeam.project.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-xl">
                <span className="text-[#777777] dark:text-neutral-400">TRACK:</span>
                <span className="text-[#111111] dark:text-white font-bold truncate max-w-[200px]">{myTeam.track}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-xl">
                <span className="text-[#777777] dark:text-neutral-400">STATUS:</span>
                <TeamStatusBadge status={myTeam.status} />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-xl">
                <span className="text-[#777777] dark:text-neutral-400">ACTIVITY LEVEL:</span>
                <ActivityIndicator level={myTeam.activityLevel} />
              </div>
            </div>
          </div>

          {/* Pending Action Items */}
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 sm:p-7 space-y-5 rounded-3xl font-inter shadow-xs">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-base sm:text-lg font-geist font-bold text-[#111111] dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#800000] dark:text-red-400" /> SUBMISSION CHECKLIST
              </h3>
            </div>

            <div className="space-y-3 font-inter text-xs">
              <div className="p-3.5 sm:p-4 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-[#800000] dark:text-red-400 shrink-0" />
                  <span className="font-inter text-xs font-medium truncate">GitHub Repository Link Verified</span>
                </div>
                <span className="text-xs text-[#800000] dark:text-red-400 font-bold shrink-0">DONE</span>
              </div>
              <div className="p-3.5 sm:p-4 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-[#800000] dark:text-red-400 shrink-0" />
                  <span className="font-inter text-xs font-medium truncate">Live Demo Link Added</span>
                </div>
                <span className="text-xs text-[#800000] dark:text-red-400 font-bold shrink-0">DONE</span>
              </div>
              <div className="p-3.5 sm:p-4 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className="w-4 h-4 text-[#777777] dark:text-neutral-400 shrink-0" />
                  <span className="font-inter text-xs font-medium truncate">Final Architecture Pitch Deck</span>
                </div>
                <span className="text-xs text-[#777777] dark:text-neutral-400 font-bold shrink-0">PENDING</span>
              </div>
            </div>
          </div>

        </div>

        {/* Competition Intelligence (Live Leaderboard Table inside Dashboard) */}
        <div className="space-y-4 pt-4">
          <div>
            <h2 className="text-2xl font-geist font-bold text-[#111111] dark:text-white">Competition Intelligence</h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter mt-0.5">Dynamic rankings updated live via judge rubric scores and code activity.</p>
          </div>

          <LiveLeaderboardTable teams={leaderboardTeams} isCompact={false} />
        </div>

      </main>
    </div>
  );
}
