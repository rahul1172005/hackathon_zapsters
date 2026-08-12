'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { GithubIcon } from '@/components/ui/Icons';
import { User, Cpu, Shield, ArrowRight } from 'lucide-react';

type RoleType = 'Participant' | 'Organizer' | 'Judge';

export default function OnboardingPage() {
  const [role, setRole] = useState<RoleType>('Participant');

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col font-inter">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-8 max-w-xl w-full space-y-6 rounded-3xl shadow-xs font-inter">
          
          <div className="space-y-1">
            <h1 className="text-3xl font-geist font-bold text-[#111111] dark:text-white">
              Setup Your Zapsters Profile
            </h1>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
              Select your primary operating role on the competition platform.
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 font-inter text-xs">
            {[
              { id: 'Participant', title: 'Participant', desc: 'Build & Compete', icon: User },
              { id: 'Organizer', title: 'Organizer', desc: 'Run Competitions', icon: Cpu },
              { id: 'Judge', title: 'Judge', desc: 'Evaluate Submissions', icon: Shield },
            ].map((r) => {
              const Icon = r.icon;
              const isSel = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as RoleType)}
                  className={`p-4 border rounded-2xl text-left space-y-2 transition-all cursor-pointer ${
                    isSel
                      ? 'bg-[#800000]/5 border-[#800000] text-[#111111] dark:text-white'
                      : 'bg-[#F7F7F5] dark:bg-neutral-900 border-[#E5E5E2] dark:border-neutral-800 text-[#777777] hover:border-[#111111]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSel ? 'text-[#800000]' : 'text-[#777777]'}`} />
                  <div>
                    <div className="font-geist font-bold text-xs">{r.title}</div>
                    <div className="text-[10px] text-[#777777] dark:text-neutral-400">{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <form action="/dashboard" className="space-y-4 text-xs font-inter">
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-[#777777] block">CONNECT GITHUB USERNAME</label>
              <div className="relative">
                <GithubIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="text"
                  placeholder="rahul-ai-dev"
                  className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors font-mono dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-[#777777] block">PRIMARY SKILLS & TECH STACK</label>
              <input
                type="text"
                placeholder="Python, PyTorch, TypeScript, Next.js, FastAPI"
                className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] px-4 py-2.5 text-xs rounded-full outline-none transition-colors dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              Complete Setup & Open Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
