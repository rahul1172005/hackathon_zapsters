'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { Save, Check } from 'lucide-react';

export default function OrganizerSettingsPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              SYSTEM CONFIGURATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Hackathon Settings & Rubric Rules
            </h1>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-geist font-bold uppercase rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaved ? 'Configurations Saved!' : 'Save Configurations'}
          </button>
        </div>

        {/* Settings Container — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 font-inter">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#800000]">
              JUDGING RUBRIC WEIGHTAGES (TOTAL 100 POINTS)
            </h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 mt-0.5">
              Configure point limits enforced during judge evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-inter">
            <div className="p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-2xl space-y-2">
              <label className="font-bold text-[#111111] dark:text-white block">INNOVATION WEIGHT</label>
              <input type="number" defaultValue={30} className="w-full py-2 px-4 bg-[#FFFFFF] dark:bg-black border border-[#E5E5E2] dark:border-neutral-800 rounded-full font-bold font-mono text-xs outline-none text-[#111111] dark:text-white focus:border-[#800000]" />
              <p className="text-[10px] text-[#777777] dark:text-neutral-400">Max points: 30</p>
            </div>

            <div className="p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-2xl space-y-2">
              <label className="font-bold text-[#111111] dark:text-white block">TECHNICAL ARCHITECTURE WEIGHT</label>
              <input type="number" defaultValue={30} className="w-full py-2 px-4 bg-[#FFFFFF] dark:bg-black border border-[#E5E5E2] dark:border-neutral-800 rounded-full font-bold font-mono text-xs outline-none text-[#111111] dark:text-white focus:border-[#800000]" />
              <p className="text-[10px] text-[#777777] dark:text-neutral-400">Max points: 30</p>
            </div>

            <div className="p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-2xl space-y-2">
              <label className="font-bold text-[#111111] dark:text-white block">REAL-WORLD IMPACT WEIGHT</label>
              <input type="number" defaultValue={20} className="w-full py-2 px-4 bg-[#FFFFFF] dark:bg-black border border-[#E5E5E2] dark:border-neutral-800 rounded-full font-bold font-mono text-xs outline-none text-[#111111] dark:text-white focus:border-[#800000]" />
              <p className="text-[10px] text-[#777777] dark:text-neutral-400">Max points: 20</p>
            </div>

            <div className="p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-2xl space-y-2">
              <label className="font-bold text-[#111111] dark:text-white block">UX & POLISH WEIGHT</label>
              <input type="number" defaultValue={10} className="w-full py-2 px-4 bg-[#FFFFFF] dark:bg-black border border-[#E5E5E2] dark:border-neutral-800 rounded-full font-bold font-mono text-xs outline-none text-[#111111] dark:text-white focus:border-[#800000]" />
              <p className="text-[10px] text-[#777777] dark:text-neutral-400">Max points: 10</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
