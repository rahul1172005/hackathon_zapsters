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
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <ParticipantSidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto pb-24 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              HACKER WORKSPACE
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">My Teams & Roster</h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3.5 py-2 bg-[#FFFFFF] border border-[#E5E5E2] hover:bg-[#F7F7F5] text-[#111111] text-xs font-mono font-bold uppercase rounded-xs transition-colors flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Join Team via Code
            </button>
            <button className="px-3.5 py-2 bg-[#111111] hover:bg-[#222222] text-white text-xs font-mono font-bold uppercase rounded-xs transition-colors flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Create New Team
            </button>
          </div>
        </div>

        {/* Joined Team Details */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#111111]">{team.name}</h2>
                <TeamStatusBadge status={team.status} />
              </div>
              <p className="text-xs font-mono text-[#666666] mt-0.5">
                {team.hackathonTitle} • Track: {team.track}
              </p>
            </div>

            {/* Invite Code Box */}
            <div className="flex items-center gap-2 bg-[#F7F7F5] border border-[#E5E5E2] px-3 py-1.5 rounded-xs font-mono text-xs">
              <span className="text-[#666666]">INVITE CODE:</span>
              <span className="font-bold text-[#111111]">{inviteCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:bg-[#E5E5E2] text-[#111111] rounded-xs"
                title="Copy Invite Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16803C]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="space-y-3 font-sans">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#666666]">
              TEAM MEMBERS ROSTER ({team.members.length} / 4 MAX)
            </h3>

            <div className="overflow-x-auto border border-[#E5E5E2]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F7F5] border-b border-[#E5E5E2] font-mono text-[10px] uppercase text-[#666666]">
                    <th className="py-2.5 px-4">MEMBER</th>
                    <th className="py-2.5 px-4">ASSIGNED ROLE</th>
                    <th className="py-2.5 px-4">CONTRIBUTION SPLIT</th>
                    <th className="py-2.5 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E2]">
                  {team.members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F7F5]">
                      <td className="py-3 px-4 font-bold text-[#111111] flex items-center gap-2.5">
                        <img src={m.avatar} alt={m.name} loading="lazy" decoding="async" className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <div>{m.name}</div>
                          <div className="text-[10px] font-mono text-[#666666]">@{m.username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#666666]">{m.role}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#111111]">{m.contributionPercentage}%</td>
                      <td className="py-3 px-4 text-right font-mono text-[10px] text-[#666666]">
                        {m.username === 'rahul_dev' ? 'TEAM LEAD' : 'MEMBER'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5E2]">
            <Link
              href="/team/cyberforge"
              className="text-xs font-mono text-[#111111] hover:underline flex items-center gap-1"
            >
              Go to Signature Team Public Profile →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
