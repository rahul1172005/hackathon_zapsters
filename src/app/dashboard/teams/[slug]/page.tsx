'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { TeamStatusBadge } from '@/components/shared/TeamStatusBadge';
import { ActivityIndicator } from '@/components/shared/ActivityIndicator';
import { getTeamBySlug } from '@/lib/mockApi';
import { Team } from '@/types';
import { GithubIcon } from '@/components/ui/Icons';
import { Globe, ArrowLeft, Users, TrendingUp } from 'lucide-react';

export default function DashboardTeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || 'cyberforge';

  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    getTeamBySlug(slug).then((res) => {
      if (res) setTeam(res);
    });
  }, [slug]);

  if (!team) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
        <ParticipantSidebar />
        <div className="flex-1 flex items-center justify-center p-12 text-xs font-inter text-[#777777]">
          Loading Team Details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      {/* Sidebar stays fixed/anchored on the left */}
      <ParticipantSidebar />

      {/* Main Content Area inside Dashboard */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        
        {/* Back Link */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-inter font-bold text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#800000] dark:text-red-400" /> Back to Workspace
          </button>
        </div>

        {/* Team Header Card — NO border lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-5 sm:p-8 space-y-6 rounded-3xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-lg sm:text-xl rounded-full shadow-xs shrink-0">
                #{String(team.rank).padStart(2, '0')}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-geist font-bold text-[#111111]">{team.name}</h1>
                  <TeamStatusBadge status={team.status} />
                </div>
                <p className="text-xs font-inter text-[#777777] mt-1">{team.hackathonTitle} • Track: {team.track}</p>
              </div>
            </div>

            <div className="bg-[#F7F7F5] p-5 rounded-2xl flex items-center gap-6 font-inter text-xs shadow-xs">
              <div className="text-right">
                <div className="text-[10px] text-[#777777] uppercase font-bold">TOTAL SCORE</div>
                <div className="text-2xl font-bold font-geist text-[#800000]">{team.score.toFixed(1)} PTS</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[#800000] font-bold">
                  <TrendingUp className="w-4 h-4" /> {team.scoreTrend}
                </div>
                <ActivityIndicator level={team.activityLevel} />
              </div>
            </div>
          </div>
        </div>

        {/* Project Idea & Case Study Card — NO border lines */}
        <div className="bg-[#FFFFFF] p-8 space-y-6 rounded-3xl shadow-xs font-inter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="text-xs font-inter font-bold text-[#800000] uppercase">PROJECT IDEA</div>
              <h2 className="text-2xl font-geist font-bold text-[#111111] mt-1">{team.project.name}</h2>
              <p className="text-xs font-inter text-[#777777] mt-0.5">{team.project.tagline}</p>
            </div>

            <div className="flex items-center gap-2 font-inter text-xs">
              {team.project.repoUrl && (
                <a
                  href={team.project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#111111] text-white hover:bg-[#222222] rounded-full flex items-center gap-2 font-bold shadow-xs"
                >
                  <GithubIcon className="w-4 h-4" /> Repository
                </a>
              )}
              {team.project.demoUrl && (
                <a
                  href={team.project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#800000] text-white hover:bg-[#660000] rounded-full flex items-center gap-2 font-bold shadow-xs"
                >
                  <Globe className="w-4 h-4" /> Live Demo
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-inter font-bold uppercase text-[#777777]">EXECUTIVE ARCHITECTURE SPECIFICATION</h3>
            <p className="text-xs text-[#111111] leading-relaxed max-w-4xl font-inter">{team.project.description}</p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-inter font-bold uppercase text-[#777777]">REGISTERED TECH STACK</h3>
            <div className="flex flex-wrap gap-2 text-xs font-inter">
              {team.project.techStack.map((tech) => (
                <span key={tech} className="px-3.5 py-1.5 bg-[#F7F7F5] text-[#111111] rounded-full font-semibold">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members Roster Card — NO border lines */}
        <div className="bg-[#FFFFFF] p-8 space-y-6 rounded-3xl shadow-xs font-inter">
          <h2 className="text-xl font-geist font-bold text-[#111111] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#800000]" /> Team Members & Roster
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-inter text-xs">
            {team.members.map((m) => (
              <div key={m.id} className="p-5 bg-[#F7F7F5] rounded-2xl space-y-2">
                <div className="flex items-center gap-3">
                  <img src={m.avatar} alt={m.name} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover shadow-xs" />
                  <div>
                    <div className="font-bold text-[#111111] text-xs font-geist">{m.name}</div>
                    <div className="text-[11px] text-[#777777]">{m.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contribution Split Progress */}
          <div className="space-y-3 pt-2 font-inter text-xs">
            <div className="text-xs font-bold text-[#777777] uppercase">CONTRIBUTION SPLIT</div>
            {team.contributionSplit.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-[#111111]">
                  <span className="font-bold">{c.name}</span>
                  <span>{c.percentage}%</span>
                </div>
                <div className="w-full bg-[#F7F7F5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#800000] h-full" style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
