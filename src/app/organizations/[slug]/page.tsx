'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { MOCK_HACKATHONS } from '@/lib/mockData';

export default function OrganizationProfilePage() {
  const orgHackathons = MOCK_HACKATHONS;

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
      <PublicNavbar />

      <section className="bg-[#FFFFFF] py-10 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-base rounded-full shadow-xs">
              Q
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111]">Quantum Systems</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-6">
        <h2 className="text-lg font-geist font-bold text-[#111111]">Hosted Competitions ({orgHackathons.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgHackathons.map((h) => (
            <div key={h.id} className="bg-[#FFFFFF] p-6 space-y-4 rounded-2xl shadow-xs hover:border-[#800000] transition-colors">
              <div className="space-y-1">
                <h3 className="text-lg font-geist font-bold text-[#111111]">{h.title}</h3>
                <p className="text-xs text-[#777777] font-inter">{h.tagline}</p>
              </div>
              <div className="pt-3 flex justify-between items-center font-inter text-xs">
                <span className="font-bold text-[#800000]">{h.prizePool}</span>
                <Link href={`/hackathons/${h.slug}`} className="px-4 py-1.5 bg-[#800000] text-white rounded-full font-bold">
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
