'use client';

import React from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { MOCK_HACKATHONS } from '@/lib/mockData';
import { Clock, ArrowRight } from 'lucide-react';

export default function MyHackathonsListPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">
              My Registered Hackathons
            </h1>
            <p className="text-xs text-[#777777] dark:text-neutral-400 mt-1 font-inter">
              Access your active workspaces and competition schedules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {MOCK_HACKATHONS.map((h) => (
            <div key={h.id} className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-5 sm:p-7 space-y-5 rounded-3xl shadow-xs hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-geist font-bold text-[#111111] dark:text-white">{h.title}</h2>
                  <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">{h.tagline}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between font-inter text-xs gap-3">
                <div className="flex items-center gap-2 text-[#777777] dark:text-neutral-400">
                  <Clock className="w-4 h-4 text-[#800000] dark:text-red-400" />
                  <span>{h.durationHours} Hours • {h.location}</span>
                </div>
                <Link
                  href={`/my-hackathons/${h.slug}/workspace`}
                  className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold rounded-full transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  Workspace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
