'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { MOCK_HACKATHONS } from '@/lib/mockData';
import { SITE_URL } from '@/app/seo';
import { Hackathon } from '@/types';
import {
  Trophy,
  Users,
  Globe,
  Award,
  Zap,
  ShieldCheck,
  Code2,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function PublicHackathonsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allHackathons: Hackathon[] = [
    ...MOCK_HACKATHONS,
    {
      id: 'hack-004',
      slug: 'decentralized-infra-2026',
      title: 'SOLANA INFRASTRUCTURE LABS',
      tagline: 'HIGH THROUGHPUT • DECENTRALIZED PROTOCOLS',
      organization: 'Solana Foundation',
      status: 'UPCOMING',
      startDate: '18 October 2026',
      endDate: '21 October 2026',
      durationHours: 72,
      location: 'Singapore / Online',
      isOnline: true,
      prizePool: '$75,000',
      participantsCount: 940,
      teamsCount: 210,
      activeTeamsCount: 0,
      submissionRate: 0,
      judgingRate: 0,
      tracks: [
        { id: 'tr-s1', name: 'Validator Performance', description: 'Optimizing RPC nodes and transaction mempools.', prize: '$35,000' },
        { id: 'tr-s2', name: 'DeFi Primitives', description: 'Zero-slippage orderbook DEX and liquidity router engines.', prize: '$40,000' },
      ],
      timeline: [],
      prizes: [],
      rules: [],
      sponsors: [],
      faqs: [],
      description: 'Global 72-hour engineering hackathon dedicated to scaling decentralized state machines and RPC relayers.',
    },
    {
      id: 'hack-005',
      slug: 'autonomous-robotics-2026',
      title: 'ROBOTICS & SPATIAL AI 2026',
      tagline: 'HARDWARE • EDGE COMPUTE • ROS2',
      organization: 'Boston Dynamic Labs',
      status: 'UPCOMING',
      startDate: '12 November 2026',
      endDate: '15 November 2026',
      durationHours: 48,
      location: 'Munich, Germany',
      isOnline: false,
      prizePool: '€40,000',
      participantsCount: 380,
      teamsCount: 88,
      activeTeamsCount: 0,
      submissionRate: 0,
      judgingRate: 0,
      tracks: [
        { id: 'tr-r1', name: 'Kinematic Motion Planning', description: 'Real-time obstacle avoidance and ROS2 control nodes.', prize: '€20,000' },
        { id: 'tr-r2', name: 'Spatial SLAM', description: 'LiDAR and stereo camera point-cloud mapping.', prize: '€20,000' },
      ],
      timeline: [],
      prizes: [],
      rules: [],
      sponsors: [],
      faqs: [],
      description: 'Physical hardware hackathon hosted in Munich focused on quadrupeds, spatial SLAM, and embedded neural runtimes.',
    },
  ];

  const filteredHackathons = allHackathons.filter((h) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'UPCOMING') return h.status === 'UPCOMING';
    if (selectedCategory === 'LIVE') return h.status === 'LIVE';
    if (selectedCategory === 'ONLINE') return h.isOnline;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F9F9F8] dark:bg-black text-[#111111] dark:text-white flex flex-col font-inter transition-colors duration-200">
      {/* Public Header Navbar */}
      <PublicNavbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Upcoming & Active Hackathons',
            itemListElement: allHackathons.map((h, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: h.title,
              url: `${SITE_URL}/hackathons/${h.slug}`,
            })),
          }),
        }}
      />

      {/* ===================== HERO SECTION ===================== */}
      <section className="w-full py-12 sm:py-20 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-geist font-light text-[#111111] dark:text-white tracking-tight leading-[1.05]">
            Build, Compete & Ship at <span className="text-[#800000] dark:text-red-400 font-geist font-light font-thin">Global Scale</span>
          </h1>

          <p className="text-base sm:text-lg text-[#777777] dark:text-neutral-400 max-w-3xl leading-relaxed">
            Discover high-stakes engineering competitions, assemble elite hacker teams, and compete for prize pools backed by automated activity telemetry and audited evaluation suites.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-start gap-3 sm:gap-4 pt-2 font-inter text-xs">
            <a
              href="#upcoming-hackathons"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#800000] hover:bg-[#660000] text-white text-xs font-geist font-light uppercase tracking-wider rounded-full transition-all shadow-md"
            >
              Explore Upcoming Hackathons <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#111111] dark:text-white text-xs font-geist font-light uppercase tracking-wider rounded-full transition-all border border-[#E5E5E2] dark:border-neutral-700"
            >
              Host a Hackathon
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 1: WHY ZAPSTERS HACKATHON PLATFORM ===================== */}
      <section className="pt-20 sm:pt-41 pb-16 sm:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-geist font-bold text-[#111111] dark:text-white">
              Why Zapsters Hackathon Platform?
            </h2>
            <p className="text-base text-[#777777] dark:text-neutral-400 mt-2 font-inter max-w-2xl">
              Designed from the ground up for data integrity, developer speed, and enterprise transparency. Every commit is tracked, every score is audited.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-inter">
            {/* Feature 1 */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-geist font-bold text-[#111111] dark:text-white group-hover:text-[#800000] dark:group-hover:text-red-400 transition-colors">
                Automated Activity Telemetry
              </h3>
              <p className="text-sm text-[#777777] dark:text-neutral-400 font-inter leading-relaxed">
                GitHub commit auditing, PR velocity tracking, and contribution distribution analysis to ensure 100% authentic code generation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-geist font-bold text-[#111111] dark:text-white group-hover:text-[#800000] dark:group-hover:text-red-400 transition-colors">
                Audited Judging Suite
              </h3>
              <p className="text-sm text-[#777777] dark:text-neutral-400 font-inter leading-relaxed">
                Multi-criterion scoring matrices, rubric weighting, and anti-bias RBAC evaluation queues for verified winner accreditation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-geist font-bold text-[#111111] dark:text-white group-hover:text-[#800000] dark:group-hover:text-red-400 transition-colors">
                Team Workspaces & Tasks
              </h3>
              <p className="text-sm text-[#777777] dark:text-neutral-400 font-inter leading-relaxed">
                Dedicated team Kanban boards, live task management, submission locking, and executive project case studies in one place.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-geist font-bold text-[#111111] dark:text-white group-hover:text-[#800000] dark:group-hover:text-red-400 transition-colors">
                Instant Grants & Rankings
              </h3>
              <p className="text-sm text-[#777777] dark:text-neutral-400 font-inter leading-relaxed">
                Global hacker leaderboards, cryptographically verifiable certificates, and direct prize pool disbursement engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 2: UPCOMING HACKATHONS ===================== */}
      <section id="upcoming-hackathons" className="pt-16 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-geist font-bold text-[#111111] dark:text-white">
                Upcoming & Active Hackathons
              </h2>
              <p className="text-base text-[#777777] dark:text-neutral-400 mt-2 font-inter">
                Select a hackathon below to inspect tracks and register your team.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 font-inter text-xs">
              {[
                { label: 'All Events', value: 'ALL' },
                { label: 'Upcoming', value: 'UPCOMING' },
                { label: 'Live Now', value: 'LIVE' },
                { label: 'Online Only', value: 'ONLINE' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSelectedCategory(f.value)}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer ${selectedCategory === f.value
                    ? 'bg-[#800000] text-white font-bold shadow-xs'
                    : 'bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white border border-[#E5E5E2] dark:border-neutral-700'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hackathon Cards Grid — Strictly Matches Home Page Card Color Palette */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter">
            {filteredHackathons.map((h) => {
              return (
                <div
                  key={h.id}
                  className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all group relative overflow-hidden"
                >
                  {/* Top Status & Prize Header */}
                  <div className="space-y-4">


                    <div className="space-y-1.5">
                      <Link href={`/hackathons/${h.slug}`} className="block group-hover:underline">
                        <h3 className="text-xl sm:text-2xl font-geist font-bold text-[#111111] dark:text-white leading-snug">
                          {h.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-[#777777] dark:text-neutral-400 font-inter leading-relaxed line-clamp-2">
                        {h.tagline}
                      </p>
                    </div>

                    {/* Specifications badges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-inter">
                      <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900/90 rounded-2xl border border-[#E5E5E2] dark:border-neutral-700 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#800000] dark:text-red-400 shrink-0" />
                        <div>
                          <div className="text-[9px] text-[#777777] dark:text-neutral-400 font-bold uppercase">PRIZE POOL</div>
                          <div className="font-bold text-[#800000] dark:text-red-400 text-xs">{h.prizePool}</div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900/90 rounded-2xl border border-[#E5E5E2] dark:border-neutral-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#777777] shrink-0" />
                        <div>
                          <div className="text-[9px] text-[#777777] dark:text-neutral-400 font-bold uppercase">DURATION</div>
                          <div className="font-bold text-[#111111] dark:text-white text-xs">{h.durationHours} Hours</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#777777] dark:text-neutral-400 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#800000]" />
                        <span>{h.startDate} - {h.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#777777]" />
                        <span>{h.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA Actions with REGISTER Button */}
                  <div className="pt-4 flex items-center gap-3">
                    <Link
                      href={`/hackathons/${h.slug}/register`}
                      className="flex-1 py-3 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs bg-[#800000] hover:bg-[#660000] text-white"
                    >
                      REGISTER FOR HACKATHON <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/hackathons/${h.slug}`}
                      title="View Details"
                      className="p-3 rounded-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-700 text-[#111111] dark:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3: BENTO GRID STATS ===================== */}
      <section className="py-12 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-geist font-bold text-[#111111] dark:text-white">
              Zapsters Platform by the Numbers
            </h2>
            <p className="text-base text-[#777777] dark:text-neutral-400 mt-2 font-inter">
              Empowering engineers, university hackers, and premier enterprise sponsors around the globe.
            </p>
          </div>

          {/* Bento Grid layout — Strictly Matches Home Page Card Color Palette */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 font-inter">

            {/* Bento Box 1: Number of Users */}
            <div className="md:col-span-2 bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs relative overflow-hidden flex flex-col justify-between group">
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-4xl sm:text-5xl font-geist font-extrabold text-[#111111] dark:text-white tracking-tight">
                  50,000+
                </div>
                <h3 className="text-lg font-geist font-bold text-[#111111] dark:text-white">
                  Verified Developers & Engineers
                </h3>
                <p className="text-sm text-[#777777] dark:text-neutral-400 leading-relaxed max-w-md font-inter">
                  Active builders across AI research labs, software engineering, robotics, and cybersecurity forming high-performing hackathon teams.
                </p>
              </div>

              {/* User Avatars stack preview */}
              <div className="flex items-center gap-3 pt-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-xs shadow-xs">
                    R
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-neutral-800 text-white flex items-center justify-center font-geist font-bold text-xs shadow-xs">
                    A
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-[#660000] text-white flex items-center justify-center font-geist font-bold text-xs shadow-xs">
                    S
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-neutral-900 text-white flex items-center justify-center font-geist font-bold text-xs shadow-xs">
                    K
                  </div>
                </div>
                <span className="text-xs text-[#777777] dark:text-neutral-400 font-bold font-inter">
                  + 49,990 Registered Hackers
                </span>
              </div>
            </div>

            {/* Bento Box 2: Number of Hackathons */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-4xl font-geist font-extrabold text-[#111111] dark:text-white tracking-tight">
                  120+
                </div>
                <h3 className="text-base font-geist font-bold text-[#111111] dark:text-white">
                  High-Stakes Hackathons
                </h3>
              </div>
              <p className="text-sm text-[#777777] dark:text-neutral-400 leading-relaxed font-inter pt-2">
                Hosted across AI, Robotics, Hardware, and Open Source ecosystems with 98% team submission rate.
              </p>
            </div>

            {/* Bento Box 3: Total Prize Money Distributed */}
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-4xl font-geist font-extrabold text-[#800000] dark:text-red-400 tracking-tight">
                  $2.5M+
                </div>
                <h3 className="text-base font-geist font-bold text-[#111111] dark:text-white">
                  Total Cash & Grants
                </h3>
              </div>
              <p className="text-sm text-[#777777] dark:text-neutral-400 leading-relaxed font-inter pt-2">
                Disbursed directly to winning hacker teams backed by transparent, audited judge rubrics.
              </p>
            </div>

            {/* Bento Box 4: 7+ Countries */}
            <div className="md:col-span-3 lg:col-span-4 bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center font-bold shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-geist font-extrabold text-[#111111] dark:text-white">
                      7+ Countries & Global Regional Hubs
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#777777] dark:text-neutral-400 font-inter leading-relaxed">
                  Connecting engineering hubs across India, USA, Germany, Singapore, Japan, UK, and Canada for hybrid and on-site finals.
                </p>
              </div>

              {/* Country Chips Grid */}
              <div className="flex flex-wrap gap-2.5 font-inter text-xs">
                {[
                  { name: '🇮🇳 India', hubs: 'Bengaluru & Chennai' },
                  { name: '🇺🇸 United States', hubs: 'San Francisco & NYC' },
                  { name: '🇩🇪 Germany', hubs: 'Munich & Berlin' },
                  { name: '🇸🇬 Singapore', hubs: 'Marina Bay' },
                  { name: '🇬🇧 United Kingdom', hubs: 'London' },
                  { name: '🇯🇵 Japan', hubs: 'Tokyo' },
                  { name: '🇨🇦 Canada', hubs: 'Toronto' },
                ].map((country) => (
                  <div
                    key={country.name}
                    className="px-4 py-2 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-700 rounded-2xl font-bold text-[#111111] dark:text-white flex items-center gap-2"
                  >
                    <span>{country.name}</span>
                    <span className="text-[10px] text-[#777777] dark:text-neutral-400 font-normal">({country.hubs})</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
