'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { MOCK_HACKATHONS } from '@/lib/mockData';
import { Search, Filter, Clock, Trophy, ArrowUpRight } from 'lucide-react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState<'All' | 'Online' | 'In-person' | 'Hybrid'>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredHackathons = MOCK_HACKATHONS.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.organization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode =
      activeMode === 'All' ||
      (activeMode === 'Online' && h.isOnline) ||
      (activeMode === 'In-person' && !h.isOnline) ||
      (activeMode === 'Hybrid' && h.location.includes('Hybrid'));

    const matchesStatus =
      selectedStatus === 'ALL' || h.status === selectedStatus;

    return matchesSearch && matchesMode && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
      <PublicNavbar />

      {/* Header — NO divider line */}
      <section className="bg-[#FFFFFF] py-12 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-geist font-extrabold text-[#111111]">
                Explore Active Competitions
              </h1>
              <p className="text-sm text-[#777777] font-inter mt-1">
                Discover hackathons, inspect track specifications, and register teams.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[300px] sm:min-w-[400px]">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                placeholder="Search hackathons, tracks, or tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F7F5] focus:bg-[#FFFFFF] border border-[#E5E5E2] focus:border-[#800000] pl-11 pr-5 py-3 text-sm font-inter rounded-full outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Mode Tabs — NO divider line */}
          <div className="flex items-center gap-2.5 font-inter text-xs pt-2">
            {(['All', 'Online', 'In-person', 'Hybrid'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`px-5 py-2 rounded-full transition-colors ${
                  activeMode === mode
                    ? 'bg-[#800000] text-white font-bold shadow-xs'
                    : 'bg-[#F7F7F5] text-[#777777] hover:text-[#111111]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Results */}
      <section className="py-12 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-[#FFFFFF] p-6 space-y-5 font-inter text-sm rounded-3xl shadow-xs">
              <div className="flex items-center justify-between font-inter font-bold text-[#111111] pb-1">
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#800000]" /> FILTERS
                </span>
                <button
                  onClick={() => {
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                    setActiveMode('All');
                  }}
                  className="text-xs text-[#777777] hover:text-[#111111]"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-2.5">
                <label className="font-inter text-xs uppercase text-[#777777] font-bold">STATUS</label>
                <div className="space-y-2 font-inter text-xs">
                  {[
                    { label: 'All Statuses', value: 'ALL' },
                    { label: 'Live Now', value: 'LIVE' },
                    { label: 'Upcoming', value: 'UPCOMING' },
                    { label: 'Judging Phase', value: 'JUDGING' },
                  ].map((st) => (
                    <label key={st.value} className="flex items-center gap-2.5 cursor-pointer text-[#111111]">
                      <input
                        type="radio"
                        name="status"
                        checked={selectedStatus === st.value}
                        onChange={() => setSelectedStatus(st.value)}
                        className="accent-[#800000]"
                      />
                      <span>{st.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Cards Grid */}
          <main className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between font-inter text-xs text-[#777777]">
              <span>SHOWING {filteredHackathons.length} COMPETITIONS</span>
              <span>SORT: RELEVANCE</span>
            </div>

            {filteredHackathons.length === 0 ? (
              <div className="bg-[#FFFFFF] p-12 text-center rounded-3xl space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-[#800000]/10 text-[#800000] flex items-center justify-center rounded-full mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-geist font-bold text-[#111111]">No Hackathons Match Your Criteria</h3>
                <p className="text-xs text-[#777777] max-w-sm mx-auto font-inter">
                  Try adjusting your search terms, status filters, or competition mode to find active events.
                </p>
                <button
                  onClick={() => {
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                    setActiveMode('All');
                  }}
                  className="px-5 py-2.5 bg-[#800000] text-white text-xs font-bold rounded-full hover:bg-[#660000]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHackathons.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    className="bg-[#FFFFFF] p-7 space-y-5 hover:border-[#800000] transition-all rounded-3xl flex flex-col justify-between group shadow-xs hover:shadow-md"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-end">
                        <span className="font-inter text-xs font-bold px-3 py-1 bg-[#800000] text-white rounded-full">
                          {hackathon.status}
                        </span>
                      </div>

                      <Link href={`/hackathons/${hackathon.slug}`} className="block space-y-1">
                        <h3 className="text-2xl font-geist font-bold text-[#111111] group-hover:underline flex items-center justify-between">
                          {hackathon.title}
                          <ArrowUpRight className="w-5 h-5 text-[#999999] group-hover:text-[#800000]" />
                        </h3>
                        <p className="text-sm text-[#777777] font-inter leading-relaxed">{hackathon.tagline}</p>
                      </Link>

                      <div className="grid grid-cols-2 gap-3 pt-3 text-xs font-inter text-[#111111] bg-[#F7F7F5] p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#777777]" />
                          <span>{hackathon.durationHours} Hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-[#800000]" />
                          <span className="font-bold text-[#800000]">{hackathon.prizePool}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <span className="text-xs font-inter text-[#777777]">
                        {hackathon.tracks.length} Competition Tracks
                      </span>
                      <Link
                        href={`/hackathons/${hackathon.slug}`}
                        className="px-5 py-2 bg-[#800000] text-white text-xs font-inter font-bold rounded-full hover:bg-[#660000] transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

        </div>
      </section>

      {/* Modern Footer */}
      <PublicFooter />
    </div>
  );
}
