'use client';

import React from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { LiveLeaderboardTable } from '@/components/shared/LiveLeaderboardTable';
import { MOCK_TEAMS, MOCK_HACKATHONS } from '@/lib/mockData';
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

export default function HackerDashboardPage() {
  const activeHackathon = MOCK_HACKATHONS[0];
  const myTeam = MOCK_TEAMS[2]; // CyberForge

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 overflow-y-auto pb-24 lg:pb-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-geist font-bold text-[#111111]">
              Good morning, Rahul Sharma
            </h1>
            <p className="text-xs text-[#777777] font-inter mt-1">Here is what you need to know or do right now.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/my-teams/team-003/submission"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              Open Submission Flow
            </Link>
          </div>
        </div>

        {/* Active Hackathon Card */}
        <div className="bg-[#FFFFFF] p-8 space-y-6 rounded-3xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-geist font-bold text-[#111111]">{activeHackathon.title}</h2>
              <p className="text-sm font-inter text-[#777777]">{activeHackathon.tagline}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-5 rounded-2xl text-right font-inter">
              <div className="text-xs text-[#777777] font-bold">SUBMISSION DEADLINE</div>
              <div className="text-lg font-bold text-[#800000] flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" /> 18:42:17 REMAINING
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-inter text-xs">
            <div className="p-5 bg-[#FFFFFF] border border-[#E5E5E2] space-y-1.5 rounded-2xl">
              <div className="text-[#777777] text-xs uppercase font-bold">MY JOINED TEAM</div>
              <div className="font-bold text-[#111111] text-base flex items-center justify-between font-geist">
                <span>{myTeam.name}</span>
                <span className="text-[#800000] text-sm">#03 Rank</span>
              </div>
            </div>
            <div className="p-5 bg-[#FFFFFF] border border-[#E5E5E2] space-y-1.5 rounded-2xl">
              <div className="text-[#777777] text-xs uppercase font-bold">CURRENT SCORE</div>
              <div className="font-bold text-[#111111] text-base flex items-center justify-between font-geist">
                <span>{myTeam.score.toFixed(1)} Pts</span>
                <span className="text-[#800000] text-sm">{myTeam.scoreTrend}</span>
              </div>
            </div>
            <div className="p-5 bg-[#FFFFFF] border border-[#E5E5E2] space-y-1.5 rounded-2xl">
              <div className="text-[#777777] text-xs uppercase font-bold">SUBMISSION READINESS</div>
              <div className="font-bold text-[#800000] text-base flex items-center justify-between font-geist">
                <span>90% READY</span>
                <CheckCircle2 className="w-5 h-5 text-[#800000]" />
              </div>
            </div>
          </div>
        </div>

        {/* Project & Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Team Workspace Card */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-7 space-y-5 rounded-3xl font-inter shadow-xs">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-lg font-geist font-bold text-[#111111] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#800000]" /> MY TEAM WORKSPACE
              </h3>
              <Link href="/my-teams/team-003/overview" className="text-xs font-inter text-[#800000] font-bold hover:underline flex items-center gap-1">
                Open Team Workspace <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3 font-inter text-xs">
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E5E5E2] rounded-xl">
                <span className="text-[#777777]">PROJECT:</span>
                <span className="font-bold text-[#111111] font-geist text-sm">{myTeam.project.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E5E5E2] rounded-xl">
                <span className="text-[#777777]">TRACK:</span>
                <span className="text-[#111111] font-bold">{myTeam.track}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E5E5E2] rounded-xl">
                <span className="text-[#777777]">STATUS:</span>
                <TeamStatusBadge status={myTeam.status} />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E5E5E2] rounded-xl">
                <span className="text-[#777777]">ACTIVITY LEVEL:</span>
                <ActivityIndicator level={myTeam.activityLevel} />
              </div>
            </div>
          </div>

          {/* Pending Action Items */}
          <div className="bg-[#FFFFFF] p-7 space-y-5 rounded-3xl font-inter shadow-xs">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-lg font-geist font-bold text-[#111111] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#800000]" /> SUBMISSION CHECKLIST
              </h3>
            </div>

            <div className="space-y-3 font-inter text-xs">
              <div className="p-4 bg-[#F7F7F5] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#800000]" />
                  <span className="font-inter text-xs font-medium">GitHub Repository Link Verified</span>
                </div>
                <span className="text-xs text-[#800000] font-bold">DONE</span>
              </div>
              <div className="p-4 bg-[#F7F7F5] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#800000]" />
                  <span className="font-inter text-xs font-medium">Live Demo Link Added</span>
                </div>
                <span className="text-xs text-[#800000] font-bold">DONE</span>
              </div>
              <div className="p-4 bg-[#F7F7F5] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#777777]" />
                  <span className="font-inter text-xs font-medium">Final Architecture Pitch Deck</span>
                </div>
                <span className="text-xs text-[#777777] font-bold">PENDING</span>
              </div>
            </div>
          </div>

        </div>

        {/* Competition Intelligence (Live Leaderboard Table inside Dashboard) */}
        <div className="space-y-4 pt-4">
          <div>
            <h2 className="text-2xl font-geist font-bold text-[#111111]">Competition Intelligence</h2>
            <p className="text-xs text-[#777777] font-inter mt-0.5">Dynamic rankings updated live via judge rubric scores and code activity.</p>
          </div>

          <LiveLeaderboardTable teams={MOCK_TEAMS} isCompact={false} />
        </div>

      </main>
    </div>
  );
}
