'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { MOCK_PARTICIPANT } from '@/lib/mockData';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';
import { ExternalLink } from 'lucide-react';

export default function UserPublicProfilePage() {
  const p = MOCK_PARTICIPANT;

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
      <PublicNavbar />

      {/* Header — NO divider lines */}
      <section className="bg-[#FFFFFF] py-12 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <img
                src={p.avatar}
                alt={p.name}
                loading="eager"
                decoding="async"
                className="w-20 h-20 rounded-full object-cover shadow-sm"
              />
              <div className="space-y-1">
                <h1 className="text-4xl font-geist font-bold text-[#111111]">{p.name}</h1>
                <p className="font-inter text-sm text-[#777777] font-semibold">{p.title}</p>
                <p className="text-sm text-[#777777] max-w-2xl leading-normal mt-2 font-inter">{p.bio}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-inter text-xs">
              <a
                href={`https://github.com/${p.githubHandle}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#111111] rounded-full font-bold transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span>@{p.githubHandle}</span>
              </a>
              <a
                href={p.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#111111] rounded-full font-bold transition-colors"
              >
                <LinkedinIcon className="w-4 h-4 text-blue-700" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 font-inter">
            <div className="p-5 bg-[#F7F7F5] rounded-2xl">
              <div className="text-xs text-[#777777] uppercase font-bold">HACKATHONS</div>
              <div className="text-3xl font-bold font-geist text-[#111111] mt-1">{p.stats.hackathonsCount}</div>
            </div>
            <div className="p-5 bg-[#F7F7F5] rounded-2xl">
              <div className="text-xs text-[#777777] uppercase font-bold">GRAND WINS</div>
              <div className="text-3xl font-bold font-geist text-[#800000] mt-1">{p.stats.wins}</div>
            </div>
            <div className="p-5 bg-[#F7F7F5] rounded-2xl">
              <div className="text-xs text-[#777777] uppercase font-bold">FINALS</div>
              <div className="text-3xl font-bold font-geist text-[#111111] mt-1">{p.stats.finals}</div>
            </div>
            <div className="p-5 bg-[#F7F7F5] rounded-2xl">
              <div className="text-xs text-[#777777] uppercase font-bold">PROJECTS</div>
              <div className="text-3xl font-bold font-geist text-[#111111] mt-1">{p.stats.projectsCount}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-geist font-bold text-[#111111]">Featured Shipped Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {p.projects.map((proj, idx) => (
              <div key={idx} className="bg-[#FFFFFF] p-7 space-y-4 rounded-3xl hover:border-[#800000] transition-colors shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-geist font-bold text-[#111111]">{proj.name}</h3>
                    <div className="text-xs font-inter text-[#777777] mt-1">{proj.hackathonName} • {proj.year}</div>
                  </div>
                  <Link href="/teams/cyberforge" className="text-xs font-inter text-[#800000] font-bold hover:underline flex items-center gap-1">
                    Repo Specs <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-sm text-[#777777] leading-relaxed font-inter">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
