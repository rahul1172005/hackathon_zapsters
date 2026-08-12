'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { MOCK_EVALUATIONS } from '@/lib/mockData';
import { ArrowLeft } from 'lucide-react';

export default function JudgeEvaluationHistoryPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
      <PublicNavbar />

      <section className="bg-[#FFFFFF] border-b border-[#E5E5E2] py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <Link
            href="/organizer/quantum-build-2026/judging"
            className="inline-flex items-center gap-1.5 text-xs text-[#777777] hover:text-[#111111] font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Review Queue
          </Link>
          <h1 className="text-3xl font-geist font-bold text-[#111111]">
            Evaluation History
          </h1>
          <p className="text-xs text-[#777777] font-mono">
            Audited evaluations locked by Dr. Aris Thorne.
          </p>
        </div>
      </section>

      <section className="py-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-4">
        {MOCK_EVALUATIONS.map((ev) => (
          <div key={ev.id} className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-3 rounded-2xl font-inter text-xs">
            <div className="flex justify-between items-center border-b border-[#E5E5E2] pb-3">
              <div>
                <h2 className="text-base font-geist font-bold text-[#111111]">{ev.teamName}</h2>
                <div className="text-mono text-[10px] text-[#777777]">EVALUATED AT {ev.updatedAt}</div>
              </div>
              <div className="font-mono text-lg font-bold text-[#800000]">{ev.totalScore} / 100 PTS</div>
            </div>
            <p className="text-xs text-[#111111] leading-relaxed">{ev.notes}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
