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
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              SYSTEM CONFIGURATION
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Hackathon Settings & Rubric Rules</h1>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#800000] hover:bg-[#660000] text-white text-xs font-mono font-bold uppercase rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {isSaved ? 'Configurations Saved!' : 'Save Configurations'}
          </button>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-6 font-sans">
          <div className="border-b border-[#E5E5E2] pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#111111]">
              JUDGING RUBRIC WEIGHTAGES (TOTAL 100 POINTS)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
              <label className="font-bold text-[#111111]">INNOVATION WEIGHT</label>
              <input type="number" defaultValue={30} className="w-full p-2 bg-[#FFFFFF] border border-[#E5E5E2] rounded-xs font-bold" />
              <p className="text-[10px] text-[#666666]">Max points: 30</p>
            </div>
            <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
              <label className="font-bold text-[#111111]">TECHNICAL ARCHITECTURE WEIGHT</label>
              <input type="number" defaultValue={30} className="w-full p-2 bg-[#FFFFFF] border border-[#E5E5E2] rounded-xs font-bold" />
              <p className="text-[10px] text-[#666666]">Max points: 30</p>
            </div>
            <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
              <label className="font-bold text-[#111111]">REAL-WORLD IMPACT WEIGHT</label>
              <input type="number" defaultValue={20} className="w-full p-2 bg-[#FFFFFF] border border-[#E5E5E2] rounded-xs font-bold" />
              <p className="text-[10px] text-[#666666]">Max points: 20</p>
            </div>
            <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E2] space-y-1">
              <label className="font-bold text-[#111111]">UX & POLISH WEIGHT</label>
              <input type="number" defaultValue={10} className="w-full p-2 bg-[#FFFFFF] border border-[#E5E5E2] rounded-xs font-bold" />
              <p className="text-[10px] text-[#666666]">Max points: 10</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
