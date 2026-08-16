'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { Layers, Calendar, Trophy, ShieldCheck, Plus, Check } from 'lucide-react';

export default function OrganizerDetailsAndTracksPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-wider">
              HACKATHON SPECIFICATIONS
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Details & Track Configurations
            </h1>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
              Manage hackathon metadata, competition tracks, prize pools, and operational timelines.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-geist font-bold uppercase rounded-full transition-colors shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            {saved ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            {saved ? 'Tracks & Details Saved!' : 'Save Configurations'}
          </button>
        </div>

        {/* Card 1: Hackathon Overview & Metadata — Curved Corners, NO Divided Lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#800000]/10 text-[#800000] rounded-2xl flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">
                General Competition Metadata
              </h2>
              <p className="text-xs text-[#777777] dark:text-neutral-400">
                Core competition parameters visible across public discovery pages and student hacker workspaces.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-inter">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] font-bold text-[#777777] uppercase block">
                COMPETITION TITLE
              </label>
              <input
                type="text"
                defaultValue="Quantum Build 2026"
                className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] px-4 py-2.5 text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] font-bold text-[#777777] uppercase block">
                TAGLINE
              </label>
              <input
                type="text"
                defaultValue="Build Autonomous Intelligence & AI Infrastructure"
                className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] px-4 py-2.5 text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] font-bold text-[#777777] uppercase block">
                TOTAL PRIZE POOL ($)
              </label>
              <input
                type="text"
                defaultValue="$35,000 USD"
                className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] px-4 py-2.5 text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] font-bold text-[#777777] uppercase block">
                START DATE
              </label>
              <input
                type="text"
                defaultValue="Feb 20, 2026"
                className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] px-4 py-2.5 text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] font-bold text-[#777777] uppercase block">
                SUBMISSION DEADLINE
              </label>
              <input
                type="text"
                defaultValue="Feb 22, 2026 • 23:59 PST"
                className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] px-4 py-2.5 text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] font-bold text-[#777777] uppercase block">
                LOCATION / FORMAT
              </label>
              <input
                type="text"
                defaultValue="Hybrid (San Francisco, CA & Online)"
                className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] px-4 py-2.5 text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Track Configurations — Curved Corners, NO Divided Lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#800000]/10 text-[#800000] rounded-2xl flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">
                  Competition Tracks & Rubrics
                </h2>
                <p className="text-xs text-[#777777] dark:text-neutral-400">
                  Configure specific track categories, prize allocations, and rubric weightings.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 hover:border-[#800000] text-[#111111] dark:text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#800000]" /> Add New Track
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-inter">
            {/* Track 1 */}
            <div className="p-5 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#800000] uppercase tracking-wider">
                  TRACK 01 • MAIN PRIZE
                </span>
                <span className="px-3 py-1 bg-[#800000] text-white rounded-full text-[10px] font-bold font-mono">
                  $15,000 USD
                </span>
              </div>
              <h3 className="text-base font-geist font-bold text-[#111111] dark:text-white">
                AI Infrastructure & Large Models
              </h3>
              <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed">
                Build high-throughput LLM serving pipelines, custom inference acceleration kernels, or scalable training infrastructure.
              </p>
            </div>

            {/* Track 2 */}
            <div className="p-5 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#800000] uppercase tracking-wider">
                  TRACK 02 • AGENTIC SYSTEMS
                </span>
                <span className="px-3 py-1 bg-[#800000] text-white rounded-full text-[10px] font-bold font-mono">
                  $10,000 USD
                </span>
              </div>
              <h3 className="text-base font-geist font-bold text-[#111111] dark:text-white">
                Autonomous Agents & Telemetry
              </h3>
              <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed">
                Construct multi-agent coordination frameworks, tool-using agentic loops, and real-time execution telemetry.
              </p>
            </div>

            {/* Track 3 */}
            <div className="p-5 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#800000] uppercase tracking-wider">
                  TRACK 03 • WEB & MOBILE
                </span>
                <span className="px-3 py-1 bg-[#800000] text-white rounded-full text-[10px] font-bold font-mono">
                  $5,000 USD
                </span>
              </div>
              <h3 className="text-base font-geist font-bold text-[#111111] dark:text-white">
                High-Performance Web Applications
              </h3>
              <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed">
                Create ultra-responsive competition platforms, real-time telemetry dashboards, and modern UI interfaces.
              </p>
            </div>

            {/* Track 4 */}
            <div className="p-5 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#800000] uppercase tracking-wider">
                  TRACK 04 • OPEN INNOVATION
                </span>
                <span className="px-3 py-1 bg-[#800000] text-white rounded-full text-[10px] font-bold font-mono">
                  $5,000 USD
                </span>
              </div>
              <h3 className="text-base font-geist font-bold text-[#111111] dark:text-white">
                Open Developer Tooling & APIs
              </h3>
              <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed">
                Develop open-source CLI utilities, developer SDKs, monitoring agents, and developer workflow automation.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Schedule Milestones — Curved Corners, NO Divided Lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#800000]/10 text-[#800000] rounded-2xl flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">
                Schedule Milestones & Deadlines
              </h2>
              <p className="text-xs text-[#777777] dark:text-neutral-400">
                Key operational phases enforced by the competition platform telemetry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-inter">
            <div className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-[#800000]">PHASE 01 • FEB 20</div>
              <div className="font-bold text-[#111111] dark:text-white">Registration & Keynote</div>
              <div className="text-[11px] text-[#777777] dark:text-neutral-400">Team formation & repo connection</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-[#800000]">PHASE 02 • FEB 21</div>
              <div className="font-bold text-[#111111] dark:text-white">Hacking & Mentorship</div>
              <div className="text-[11px] text-[#777777] dark:text-neutral-400">Live telemetry & mentor check-ins</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-[#800000]">PHASE 03 • FEB 22</div>
              <div className="font-bold text-[#111111] dark:text-white">Submission Lockout</div>
              <div className="text-[11px] text-[#777777] dark:text-neutral-400">Repositories & video demos locked</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-[#800000]">PHASE 04 • FEB 23</div>
              <div className="font-bold text-[#111111] dark:text-white">Rubric Judging & Ceremony</div>
              <div className="text-[11px] text-[#777777] dark:text-neutral-400">Live evaluation & prize distribution</div>
            </div>
          </div>
        </div>

        {/* Card 4: Rules & Compliance — Curved Corners, NO Divided Lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#800000]/10 text-[#800000] rounded-2xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">
                Rules & Submission Guidelines
              </h2>
              <p className="text-xs text-[#777777] dark:text-neutral-400">
                Official competition terms enforced across team project submissions.
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-[#777777] dark:text-neutral-400 font-inter leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#800000] mt-1.5 shrink-0" />
              All project code must be written during the hackathon period. Pre-existing open-source libraries may be used with explicit disclosure.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#800000] mt-1.5 shrink-0" />
              Teams are limited to a maximum of 4 student members.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#800000] mt-1.5 shrink-0" />
              Submissions require a public GitHub repository link and a 2-minute video demonstration.
            </li>
          </ul>
        </div>

      </main>
    </div>
  );
}
