'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { MOCK_EVALUATIONS } from '@/lib/mockData';
import { ArrowLeft } from 'lucide-react';

export default function JudgeEvaluationHistoryPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F8] dark:bg-black text-[#111111] dark:text-white flex flex-col font-inter transition-colors duration-200">
      <PublicNavbar />

      <section className="bg-transparent py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3 font-inter">
          <Link
            href="/organizer/quantum-build-2026/judging"
            className="inline-flex items-center gap-1.5 text-xs text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white font-inter font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#800000]" /> Back to Review Queue
          </Link>
          <h1 className="text-3xl font-geist font-bold text-[#111111] dark:text-white">
            Evaluation History
          </h1>
          <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
            Audited evaluations locked by Dr. Aris Thorne.
          </p>
        </div>
      </section>

      <section className="py-6 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-4 font-inter">
        {MOCK_EVALUATIONS.map((ev) => (
          <div key={ev.id} className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-7 space-y-3 rounded-3xl shadow-xs font-inter text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">{ev.teamName}</h2>
                <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400">EVALUATED AT {ev.updatedAt}</div>
              </div>
              <div className="font-geist text-xl font-bold text-[#800000]">{ev.totalScore} / 100 PTS</div>
            </div>

            <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed pt-1">{ev.notes}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
