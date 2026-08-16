'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { MOCK_HACKATHONS } from '@/lib/mockData';

export default function OrganizationProfilePage() {
  const orgHackathons = MOCK_HACKATHONS;

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-black text-[#111111] dark:text-white flex flex-col font-inter transition-colors duration-200">
      <PublicNavbar />

      <section className="bg-[#FFFFFF] dark:bg-[#141414] py-10 shadow-xs border-b border-transparent dark:border-neutral-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-base rounded-full shadow-xs">
              Z
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">Zapsters Labs</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-6">
        <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">Hosted Competitions ({orgHackathons.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgHackathons.map((h) => (
            <div key={h.id} className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 space-y-4 rounded-2xl shadow-xs hover:border-[#800000] transition-colors">
              <div className="space-y-1">
                <h3 className="text-lg font-geist font-bold text-[#111111] dark:text-white">{h.title}</h3>
                <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">{h.tagline}</p>
              </div>
              <div className="pt-3 flex justify-between items-center font-inter text-xs">
                <span className="font-bold text-[#800000] dark:text-red-400">{h.prizePool}</span>
                <Link href={`/hackathons/${h.slug}`} className="px-4 py-1.5 bg-[#800000] hover:bg-[#660000] text-white rounded-full font-bold transition-colors">
                  View Hackathon →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
