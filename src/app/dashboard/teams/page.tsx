'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { MOCK_TEAMS } from '@/lib/mockData';
import { TeamStatusBadge } from '@/components/shared/TeamStatusBadge';
import { Plus, UserPlus, Copy, Check } from 'lucide-react';

export default function MyTeamsPage() {
  const team = MOCK_TEAMS[2]; // CyberForge
  const [copied, setCopied] = useState(false);
  const [inviteCode] = useState('CYBER-2026-X9F');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              HACKER WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">My Teams & Roster</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-inter">
            <button className="px-4 py-2 bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 hover:border-[#800000] text-[#111111] dark:text-white font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <UserPlus className="w-3.5 h-3.5 text-[#800000]" /> Join Team via Code
            </button>
            <button className="px-4 py-2 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-full transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Create New Team
            </button>
          </div>
        </div>

        {/* Joined Team Details — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 sm:p-8 rounded-3xl shadow-xs space-y-6 font-inter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-geist font-bold text-[#111111] dark:text-white">{team.name}</h2>
                <TeamStatusBadge status={team.status} />
              </div>
              <p className="text-xs font-inter text-[#777777] dark:text-neutral-400 mt-0.5">
                {team.hackathonTitle} • Track: {team.track}
              </p>
            </div>

            {/* Invite Code Box */}
            <div className="flex items-center gap-2 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 px-4 py-2 rounded-full font-mono text-xs">
              <span className="text-[#777777] dark:text-neutral-400 font-bold">INVITE CODE:</span>
              <span className="font-bold text-[#800000]">{inviteCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#111111] dark:text-white rounded-full transition-colors cursor-pointer"
                title="Copy Invite Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#800000]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Members Table — Curved Corners rounded-3xl, NO divided lines */}
          <div className="space-y-3 font-inter">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#800000]">
              TEAM MEMBERS ROSTER ({team.members.length} / 4 MAX)
            </h3>

            <div className="overflow-x-auto border border-[#E5E5E2] dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs font-inter">
                <thead>
                  <tr className="bg-[#F7F7F5] dark:bg-neutral-900 font-mono text-[10px] uppercase text-[#777777] dark:text-neutral-400">
                    <th className="py-3 px-5">MEMBER</th>
                    <th className="py-3 px-5">ASSIGNED ROLE</th>
                    <th className="py-3 px-5">CONTRIBUTION SPLIT</th>
                    <th className="py-3 px-5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {team.members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F7F5] dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#111111] dark:text-white flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} loading="lazy" decoding="async" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div>
                          <div>{m.name}</div>
                          <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400">@{m.username}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[#777777] dark:text-neutral-400">{m.role}</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-[#111111] dark:text-white">{m.contributionPercentage}%</td>
                      <td className="py-3.5 px-5 text-right font-mono text-[10px] text-[#777777] dark:text-neutral-400">
                        {m.username === 'rahul_dev' ? 'TEAM LEAD' : 'MEMBER'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 font-inter">
            <Link
              href="/team/cyberforge"
              className="text-xs font-bold text-[#800000] hover:underline flex items-center gap-1"
            >
              Go to Signature Team Public Profile →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
