'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { getHackathonBySlug } from '@/lib/mockApi';
import { Hackathon } from '@/types';
import { Users, Send } from 'lucide-react';

export default function ParticipantHackathonWorkspacePage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Timeline' | 'Tracks' | 'Rules' | 'Announcements' | 'Resources'>('Overview');

  useEffect(() => {
    getHackathonBySlug(hackathonId).then(setHackathon);
  }, [hackathonId]);

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex font-inter">
        <ParticipantSidebar />
        <div className="flex-1 flex items-center justify-center p-12 text-xs font-mono text-[#777777]">
          Loading Hackathon Workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <h1 className="text-2xl font-geist font-bold text-[#111111]">{hackathon.title} Workspace</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/my-teams/team-003/overview"
              className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white text-xs font-mono font-bold uppercase rounded-full transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Team Workspace
            </Link>
            <Link
              href="/my-teams/team-003/submission"
              className="px-4 py-2 bg-[#800000] hover:bg-[#660000] text-white text-xs font-mono font-bold uppercase rounded-full transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submission Flow
            </Link>
          </div>
        </div>

        {/* Workspace Sub-nav Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5E5E2] pb-3 text-xs font-mono overflow-x-auto">
          {(['Overview', 'Timeline', 'Tracks', 'Rules', 'Announcements', 'Resources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-[#800000] text-white font-bold'
                  : 'bg-[#FFFFFF] border border-[#E5E5E2] text-[#777777] hover:text-[#111111]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-6">
          {activeTab === 'Overview' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-2">
                <h2 className="text-base font-geist font-bold text-[#111111]">COMPETITION OBJECTIVE</h2>
                <p className="text-xs text-[#111111] leading-relaxed">{hackathon.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E5E5E2]">
                <div className="p-4 bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
                  <div className="text-[10px] font-mono text-[#777777]">TOTAL PRIZE POOL</div>
                  <div className="text-xl font-mono font-bold text-[#800000]">{hackathon.prizePool}</div>
                </div>
                <div className="p-4 bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
                  <div className="text-[10px] font-mono text-[#777777]">ACTIVE TEAMS</div>
                  <div className="text-xl font-mono font-bold text-[#111111]">{hackathon.activeTeamsCount} Teams</div>
                </div>
                <div className="p-4 bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
                  <div className="text-[10px] font-mono text-[#777777]">SUBMISSION RATE</div>
                  <div className="text-xl font-mono font-bold text-[#800000]">{hackathon.submissionRate}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Announcements' && (
            <div className="space-y-4 text-xs font-inter">
              <h2 className="text-base font-geist font-bold text-[#111111]">ORGANIZER ANNOUNCEMENTS</h2>
              <div className="p-4 bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
                <div className="font-geist font-bold text-[#111111]">Submission Window Open</div>
                <p className="text-xs text-[#777777]">Teams can now submit final GitHub repository links and demo URLs.</p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
