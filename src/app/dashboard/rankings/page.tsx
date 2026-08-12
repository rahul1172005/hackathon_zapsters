'use client';

import React from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { MOCK_PARTICIPANT } from '@/lib/mockData';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const SHIELD_RANKS = [
  {
    level: 1,
    rank: 'Initiator',
    title: 'Initiator',
    image: '/images (4)/16.png',
    status: 'UNLOCKED',
    unlockedDate: '2026-08-01 Unlocked',
    scoreNeeded: '0 PTS (Active Rank)',
    borderStyle: 'bg-[#FFFFFF] shadow-xs',
    category: 'progression',
    hackerCount: '1.2M Unlocked',
    scale: 1.05,
    x: 0,
    y: 0,
  },
  {
    level: 2,
    rank: 'Oracle',
    title: 'Predictor',
    image: '/images (4)/17.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 3,000 PTS',
    scoreNeeded: '3,000 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'progression',
    hackerCount: '450k Striving',
    scale: 1.0,
    x: 0,
    y: 0,
  },
  {
    level: 3,
    rank: 'Spartan',
    title: 'Warrior',
    image: '/images (4)/18.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 5,000 PTS',
    scoreNeeded: '5,000 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'progression',
    hackerCount: '180k Striving',
    scale: 1.0,
    x: 0,
    y: 0,
  },
  {
    level: 4,
    rank: 'Titan',
    title: 'Architect',
    image: '/images (4)/19.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 8,001 PTS',
    scoreNeeded: '8,001 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'identity',
    hackerCount: '99.4k Striving',
    scale: 1.0,
    x: 0,
    y: 0,
  },
  {
    level: 5,
    rank: 'Atlas',
    title: 'Foundation Lead',
    image: '/images (4)/20.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 12,501 PTS',
    scoreNeeded: '12,501 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'identity',
    hackerCount: '42.3k Striving',
    scale: 0.9,
    x: 0,
    y: 0,
  },
  {
    level: 6,
    rank: 'Hyperion',
    title: 'Lightbringer',
    image: '/images (4)/21.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 18,001 PTS',
    scoreNeeded: '18,001 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'activity',
    hackerCount: '12.1k Striving',
    scale: 1.1,
    x: 0,
    y: 0,
  },
  {
    level: 7,
    rank: 'Olympian',
    title: 'Champion',
    image: '/images (4)/22.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 25,001 PTS',
    scoreNeeded: '25,001 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'activity',
    hackerCount: '5.4k Striving',
    scale: 1.17,
    x: 0,
    y: 0,
  },
  {
    level: 8,
    rank: 'Primordial',
    title: 'Genesis Builder',
    image: '/images (4)/23.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 35,001 PTS',
    scoreNeeded: '35,001 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'collection',
    hackerCount: '1.2k Striving',
    scale: 1.2,
    x: 0,
    y: 0,
  },
  {
    level: 9,
    rank: 'Ascendant',
    title: 'Sovereign',
    image: '/images (4)/24.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 50,001 PTS',
    scoreNeeded: '50,001 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'collection',
    hackerCount: '410 Striving',
    scale: 1.2,
    x: 0,
    y: 0,
  },
  {
    level: 10,
    rank: 'Deus',
    title: 'God-Tier Operator',
    image: '/images (4)/25.png',
    status: 'LOCKED',
    unlockedDate: 'Score Needed: 80,001 PTS',
    scoreNeeded: '80,001 PTS',
    borderStyle: 'bg-[#FFFFFF] opacity-80 shadow-xs',
    category: 'collection',
    hackerCount: '88 Striving',
    scale: 1.3,
    x: 0,
    y: 0,
  },
];

export default function DashboardRankingsPage() {
  const participant = MOCK_PARTICIPANT;
  const currentScore = 2450;
  const targetScore = 3000;
  const progressPercent = Math.min(100, Math.round((currentScore / targetScore) * 100));

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] text-[#111111] dark:text-white flex font-inter">
      {/* Navigation Sidebar anchored on the left */}
      <ParticipantSidebar />

      {/* Main Workspace Body */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto pb-24 lg:pb-8">
        
        {/* Top Navigation Back Link */}
        <div>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-xs font-inter font-bold text-[#777777] dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white transition-colors bg-[#FFFFFF] dark:bg-[#141414] px-4 py-2 rounded-full border border-[#E5E5E2] dark:border-neutral-800 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#800000] dark:text-red-400" /> Back to Hacker Profile
          </Link>
        </div>

        {/* 1. Header Podium Banner Card */}
        <div className="relative rounded-3xl bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 sm:p-8 overflow-hidden shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
            
            {/* Left User Profile Summary & Directly Embedded Score Progress */}
            <div className="space-y-4 sm:space-y-5 max-w-xl">
              <div className="flex items-center gap-3">
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  loading="eager"
                  decoding="async"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-[#800000] dark:border-red-500 shadow-xs"
                />
                <div>
                  <div className="font-geist font-bold text-sm sm:text-base text-[#111111] dark:text-white">{participant.name}</div>
                  <div className="text-xs text-[#777777] dark:text-neutral-400 font-mono">@{participant.githubHandle}</div>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-geist font-extrabold tracking-tight text-[#111111] dark:text-white flex flex-wrap items-center gap-2">
                  Current Rank: <span className="text-[#800000] dark:text-red-400">Initiator</span>
                </h1>
                <p className="text-sm text-[#777777] dark:text-neutral-400 font-inter">
                  Outranked <strong className="text-[#800000] dark:text-red-400 font-bold">88.91%</strong> of platform hackers! Impressive performance!
                </p>
              </div>

              {/* Directly Embedded Score & Progress Bar */}
              <div className="space-y-2 pt-1 max-w-md">
                <div className="flex items-center justify-between text-xs font-inter">
                  <span className="text-[#777777] dark:text-neutral-400 uppercase font-mono tracking-wider">Level Progress</span>
                  <span className="text-[#800000] dark:text-red-400 font-bold font-mono text-sm">
                    {currentScore.toLocaleString()} / {targetScore.toLocaleString()} PTS
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#E5E5E2] dark:bg-[#0D0D0D] rounded-full h-3 overflow-hidden p-0.5 border border-[#D5D5D0] dark:border-neutral-800">
                  <div
                    className="bg-gradient-to-r from-[#800000] via-[#990000] to-[#700000] h-full rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-inter text-[#777777] dark:text-neutral-400">
                  <span>Next Rank: <strong className="text-[#111111] dark:text-white font-bold">Oracle (LVL.2)</strong></span>
                  <span className="font-mono font-semibold text-[#800000] dark:text-red-400">{(targetScore - currentScore).toLocaleString()} PTS Needed</span>
                </div>
              </div>
            </div>

            {/* Right Stage Display — hidden on very small mobile to save space */}
            <div className="hidden sm:flex relative flex-col items-center justify-center">
              <img
                src={SHIELD_RANKS[0].image}
                alt="Initiator - Current Active Rank"
                loading="eager"
                decoding="async"
                className="w-36 h-36 sm:w-52 sm:h-52 md:w-60 md:h-60 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                style={{
                  transform: `scale(${SHIELD_RANKS[0].scale ?? 1}) translate(${SHIELD_RANKS[0].x ?? 0}px, ${SHIELD_RANKS[0].y ?? 0}px)`,
                }}
              />
            </div>

          </div>
        </div>

        {/* 2. Shield Cards Grid Layout (All 10 Rank Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7">
          {SHIELD_RANKS.map((item) => {
            const isCurrent = item.level === 1; // Level 1 Initiator is active rank
            const isNextRank = item.level === 2; // Level 2 Oracle is next rank
            const isVisibleImage = isCurrent || isNextRank; // Only Level 1 & Level 2 images visible

            return (
              <div key={item.level} className="flex flex-col items-center space-y-3">
                
                {/* Shield-Shaped Badge Card Frame */}
                <div
                  className={`relative w-full aspect-[4/5] rounded-b-[40px] rounded-t-2xl p-4 flex flex-col items-center justify-between overflow-hidden bg-[#FFFFFF] dark:bg-[#141414] shadow-xs ${
                    isCurrent ? 'ring-2 ring-[#800000]/30 dark:ring-red-500/30' : 'opacity-90'
                  }`}
                >
                  {/* Embedded Rank Image (Level 1 & 2 fully visible with natural shadow, Levels 3-10 black silhouette) */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden my-auto p-2">
                    <img
                      src={item.image}
                      alt={item.rank}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-contain ${
                        isVisibleImage
                          ? 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]'
                          : 'filter brightness-0 opacity-75 dark:invert dark:opacity-50 drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]'
                      }`}
                      style={{
                        transform: `scale(${item.scale ?? 1}) translate(${item.x ?? 0}px, ${item.y ?? 0}px)`,
                      }}
                    />
                  </div>

                  {/* Bottom Shield Inner Subtext */}
                  <div className="text-[10px] font-mono text-center uppercase tracking-wider pb-1">
                    {isCurrent ? (
                      <span className="text-[#800000] dark:text-red-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE RANK
                      </span>
                    ) : (
                      <span className="text-[#777777] dark:text-neutral-500 font-semibold flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-[#777777] dark:text-neutral-500" /> LOCKED
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Text Below Shield Card */}
                <div className="text-center space-y-1 font-inter">
                  <h3 className="text-base font-geist font-bold text-[#111111] dark:text-white tracking-tight">
                    {item.rank}
                  </h3>
                  <div className="text-xs font-mono font-bold text-[#777777] dark:text-neutral-400">
                    - LVL.{item.level} -
                  </div>
                  <div className="text-[11px] font-inter text-[#777777] dark:text-neutral-400 font-medium">
                    {item.unlockedDate}
                  </div>
                  <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-500">
                    {item.hackerCount}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
