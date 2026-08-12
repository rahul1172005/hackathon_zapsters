'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { getHackathonBySlug } from '@/lib/mockApi';
import { Hackathon } from '@/types';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
} from 'lucide-react';

export default function HackathonDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'quantum-build-2026';

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Tracks' | 'Timeline' | 'Prizes' | 'Sponsors' | 'Rules' | 'FAQ'>('Overview');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    getHackathonBySlug(slug).then((res) => {
      if (res) setHackathon(res);
    });
  }, [slug]);

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center p-12 text-sm font-inter text-[#777777]">
          Loading Hackathon Specifications...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
      <PublicNavbar />

      {/* Main Hackathon Header Section — NO divider lines */}
      <section className="bg-[#FFFFFF] py-12 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex items-center gap-2 font-inter text-xs text-[#777777]">
            <Link href="/explore" className="hover:text-[#111111]">Explore</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#999999]" />
            <span className="text-[#111111] font-bold">{hackathon.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-geist font-extrabold text-[#111111] tracking-tight">
                {hackathon.title}
              </h1>
              <p className="text-base sm:text-lg font-inter text-[#777777]">
                {hackathon.tagline}
              </p>
            </div>

            {/* Quick Register Box */}
            <div className="bg-[#F7F7F5] p-6 rounded-3xl space-y-4 min-w-[320px] shadow-xs">
              <div className="flex justify-between items-baseline font-inter">
                <span className="text-xs text-[#777777] font-bold">TOTAL PRIZE POOL</span>
                <span className="text-2xl font-bold font-geist text-[#800000]">{hackathon.prizePool}</span>
              </div>
              
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                disabled={registered}
                className={`w-full py-3 px-6 text-xs font-inter font-bold uppercase tracking-wider rounded-full transition-all shadow-xs flex items-center justify-center gap-2 ${
                  registered
                    ? 'bg-[#111111] text-white cursor-default'
                    : 'bg-[#800000] hover:bg-[#660000] text-white'
                }`}
              >
                {registered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Registered as Hacker
                  </>
                ) : (
                  <>Register for Competition</>
                )}
              </button>

              <div className="text-xs font-inter text-center text-[#777777]">
                {hackathon.participantsCount} Hackers Registered • {hackathon.teamsCount} Teams Formed
              </div>
            </div>
          </div>

          {/* Quick Specifications Bar — NO divider lines */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 font-inter text-sm text-[#111111]">
            <div className="flex items-center gap-3 p-4 bg-[#F7F7F5] rounded-2xl">
              <Clock className="w-5 h-5 text-[#800000]" />
              <div>
                <div className="text-[10px] text-[#777777]">DURATION</div>
                <div className="font-bold">{hackathon.durationHours} HOURS</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#F7F7F5] rounded-2xl">
              <Calendar className="w-5 h-5 text-[#800000]" />
              <div>
                <div className="text-[10px] text-[#777777]">DATES</div>
                <div className="font-bold">{hackathon.startDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#F7F7F5] rounded-2xl">
              <MapPin className="w-5 h-5 text-[#800000]" />
              <div>
                <div className="text-[10px] text-[#777777]">LOCATION</div>
                <div className="font-bold truncate">{hackathon.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#F7F7F5] rounded-2xl">
              <Users className="w-5 h-5 text-[#800000]" />
              <div>
                <div className="text-[10px] text-[#777777]">SUBMISSION RATE</div>
                <div className="font-bold text-[#800000]">{hackathon.submissionRate}% ACTIVE</div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation — NO divider lines */}
          <div className="flex items-center gap-2.5 pt-4 font-inter text-xs overflow-x-auto">
            {(['Overview', 'Tracks', 'Timeline', 'Prizes', 'Sponsors', 'Rules', 'FAQ'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full transition-colors shrink-0 ${
                    activeTab === tab
                      ? 'bg-[#800000] text-white font-bold shadow-xs'
                      : 'bg-[#F7F7F5] text-[#777777] hover:text-[#111111]'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

        </div>
      </section>

      {/* Main Tab Content */}
      <section className="py-12 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="bg-[#FFFFFF] p-8 sm:p-10 space-y-8 rounded-3xl shadow-xs font-inter">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-geist font-bold text-[#111111]">
                  About The Competition
                </h2>
                <p className="text-base text-[#111111] leading-relaxed max-w-4xl font-inter">
                  {hackathon.description}
                </p>
              </div>

              {/* Tracks Section Preview */}
              <div className="space-y-4 pt-4">
                <h2 className="text-2xl font-geist font-bold text-[#111111]">
                  Competition Tracks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hackathon.tracks.map((tr) => (
                    <div key={tr.id} className="p-6 bg-[#F7F7F5] rounded-2xl space-y-3">
                      <div className="font-geist text-lg font-bold text-[#111111]">{tr.name}</div>
                      <p className="text-sm text-[#777777] leading-relaxed font-inter">{tr.description}</p>
                      <div className="text-xs font-inter font-bold text-[#800000] pt-2">
                        TRACK PRIZE: {tr.prize}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TRACKS TAB */}
          {activeTab === 'Tracks' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-geist font-bold text-[#111111]">All Track Specifications</h2>
              <div className="space-y-4">
                {hackathon.tracks.map((tr) => (
                  <div key={tr.id} className="p-6 bg-[#F7F7F5] rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-geist font-bold text-[#111111]">{tr.name}</h3>
                      <span className="font-inter text-xs font-bold text-[#800000] bg-[#800000]/10 px-3 py-1 rounded-full">
                        {tr.prize}
                      </span>
                    </div>
                    <p className="text-sm text-[#777777] leading-relaxed font-inter">{tr.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'Timeline' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-geist font-bold text-[#111111]">Competition Milestones</h2>
              <div className="space-y-3 font-inter text-xs">
                {hackathon.timeline.map((phase) => (
                  <div
                    key={phase.id}
                    className="p-5 bg-[#F7F7F5] rounded-2xl flex items-center justify-between"
                  >
                    <div className="font-bold text-[#111111] text-base font-geist">{phase.name}</div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#777777] font-inter">{phase.date}</span>
                      <span className="px-3.5 py-1 text-xs uppercase font-bold rounded-full bg-[#111111] text-white">
                        {phase.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRIZES TAB */}
          {activeTab === 'Prizes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-geist font-bold text-[#111111]">Prize Pool & Awards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hackathon.prizes.map((pz, idx) => (
                  <div key={idx} className="p-6 bg-[#F7F7F5] rounded-2xl space-y-3">
                    <div className="text-xs font-inter text-[#777777] uppercase font-bold">{pz.title}</div>
                    <div className="text-3xl font-geist font-bold text-[#800000]">{pz.amount}</div>
                    <p className="text-xs text-[#777777] font-inter">{pz.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPONSORS TAB */}
          {activeTab === 'Sponsors' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-geist font-bold text-[#111111]">Sponsors & Partners</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {hackathon.sponsors.map((sp) => (
                  <div key={sp.id} className="p-6 bg-[#F7F7F5] rounded-2xl text-center space-y-2">
                    <div className="font-geist font-bold text-lg text-[#111111]">{sp.name}</div>
                    <div className="font-inter text-xs text-[#777777] uppercase bg-[#E5E5E2] inline-block px-3 py-1 rounded-full">
                      {sp.tier} Partner
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RULES TAB */}
          {activeTab === 'Rules' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-geist font-bold text-[#111111]">Official Competition Rules</h2>
              <div className="space-y-3 text-sm text-[#111111]">
                {hackathon.rules.map((rule, idx) => (
                  <div key={idx} className="leading-relaxed bg-[#F7F7F5] p-5 rounded-2xl font-inter">
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ TAB */}
          {activeTab === 'FAQ' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-geist font-bold text-[#111111]">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {hackathon.faqs.map((faq, idx) => (
                  <div key={idx} className="p-6 bg-[#F7F7F5] rounded-2xl space-y-2">
                    <h3 className="text-base font-geist font-bold text-[#111111]">{faq.question}</h3>
                    <p className="text-sm text-[#777777] leading-relaxed font-inter">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Modern Footer */}
      <PublicFooter />

      {/* Registration Modal Simulation */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] max-w-md w-full p-8 space-y-6 font-inter shadow-2xl rounded-3xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-geist font-bold text-[#111111]">
                HACKER REGISTRATION
              </h2>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-sm text-[#999999] hover:text-[#111111]">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-inter text-xs text-[#777777] font-bold block">PARTICIPANT NAME</label>
                <input type="text" defaultValue="Rahul Sharma" className="w-full p-3 bg-[#F7F7F5] border-none text-xs rounded-full font-inter" readOnly />
              </div>
              <div className="space-y-1">
                <label className="font-inter text-xs text-[#777777] font-bold block">PREFERRED TRACK</label>
                <select className="w-full p-3 bg-[#F7F7F5] border-none text-xs rounded-full font-inter">
                  {hackathon.tracks.map((t) => (
                    <option key={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 font-inter text-xs">
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-5 py-2.5 bg-[#F7F7F5] text-[#777777] rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRegistered(true);
                  setIsRegisterModalOpen(false);
                }}
                className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-full shadow-xs"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
