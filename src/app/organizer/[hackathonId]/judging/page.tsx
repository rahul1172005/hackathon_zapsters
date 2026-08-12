'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { getTeams, getJudges } from '@/lib/mockApi';
import { Team, Judge } from '@/types';
import { Shield } from 'lucide-react';

export default function OrganizerJudgingPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  const [teams, setTeams] = useState<Team[]>([]);
  const [judge, setJudge] = useState<Judge | null>(null);

  useEffect(() => {
    getTeams().then(setTeams);
    getJudges(hackathonId).then((res) => setJudge(res[0] || null));
  }, [hackathonId]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        
        {/* Header Section — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#800000]" />
              <span className="font-inter text-xs text-[#800000] uppercase tracking-widest font-bold">
                EVALUATION CONTROL PORTAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Judging &amp; Rubric Scoring Engine
            </h1>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
              Evaluate team submissions using precision rubric sliders and audit live judge scores.
            </p>
          </div>

          {judge && (
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-4 rounded-2xl flex items-center gap-3.5 text-xs shadow-xs self-start sm:self-auto">
              <img src={judge.avatar} alt={judge.name} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div>
                <div className="font-bold text-[#111111] dark:text-white font-geist text-sm">{judge.name}</div>
                <div className="text-xs text-[#777777] dark:text-neutral-400 font-inter">{judge.organization} • {judge.role}</div>
              </div>
            </div>
          )}
        </div>

        {/* Workload Metric Summary Cards — Curved Corners rounded-2xl, NO divided lines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-inter">
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 space-y-1.5 rounded-2xl shadow-xs">
            <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400 font-bold uppercase tracking-wider">TOTAL ASSIGNED TEAMS</div>
            <div className="text-3xl font-extrabold font-geist text-[#111111] dark:text-white">18 TEAMS</div>
            <div className="text-[11px] text-[#777777] dark:text-neutral-400 font-medium">Quantum Build 2026 Queue</div>
          </div>
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 space-y-1.5 rounded-2xl shadow-xs">
            <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400 font-bold uppercase tracking-wider">EVALUATIONS COMPLETED</div>
            <div className="text-3xl font-extrabold font-geist text-[#800000]">12 COMPLETED</div>
            <div className="text-[11px] text-[#800000] font-semibold">66.7% Queue Finalized</div>
          </div>
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 space-y-1.5 rounded-2xl shadow-xs">
            <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400 font-bold uppercase tracking-wider">REMAINING IN QUEUE</div>
            <div className="text-3xl font-extrabold font-geist text-[#111111] dark:text-white">6 REMAINING</div>
            <div className="text-[11px] text-[#777777] dark:text-neutral-400 font-medium">Action Required</div>
          </div>
        </div>

        {/* Review Queue Table Container — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 space-y-6 rounded-3xl font-inter shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <h2 className="font-geist font-bold text-lg text-[#111111] dark:text-white">
                ASSIGNED TEAM EVALUATION QUEUE
              </h2>
              <p className="text-xs text-[#777777] dark:text-neutral-400">Review project deliverables, technical telemetry, and submit rubric scores.</p>
            </div>
            <Link
              href={`/organizer/${hackathonId}/judges`}
              className="text-[#800000] text-xs font-bold hover:underline"
            >
              View Judges Workload Matrix →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-xs border-separate border-spacing-y-2">
              <thead>
                <tr className="font-mono text-[10px] uppercase text-[#777777] dark:text-neutral-400">
                  <th className="py-3 px-5">TEAM</th>
                  <th className="py-3 px-5">TRACK</th>
                  <th className="py-3 px-5">SUBMITTED PROJECT</th>
                  <th className="py-3 px-5 text-center">STATUS</th>
                  <th className="py-3 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="font-inter">
                {teams.map((t, idx) => {
                  const isDone = idx < 2;
                  return (
                    <tr key={t.id} className="bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800/80 rounded-2xl transition-all">
                      <td className="py-3.5 px-5 font-geist font-bold text-[#111111] dark:text-white rounded-l-2xl">
                        {t.name}
                      </td>
                      <td className="py-3.5 px-5 font-inter text-xs text-[#777777] dark:text-neutral-400">{t.track}</td>
                      <td className="py-3.5 px-5 font-inter text-xs text-[#111111] dark:text-white font-semibold">{t.project.name}</td>
                      <td className="py-3.5 px-5 text-center font-inter">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#800000] bg-[#800000]/10 border border-[#800000]/20 px-3 py-1 rounded-full">
                            EVALUATED (88/100)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#777777] dark:text-neutral-300 bg-[#E5E5E2] dark:bg-neutral-800 px-3 py-1 rounded-full">
                            PENDING REVIEW
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-inter rounded-r-2xl">
                        <Link
                          href={`/organizer/${hackathonId}/judging/review/${t.slug}`}
                          className={`px-4 py-2 text-xs font-bold rounded-full transition-colors inline-flex items-center gap-1 ${
                            isDone
                              ? 'bg-[#FFFFFF] dark:bg-black text-[#111111] dark:text-white hover:bg-[#E5E5E2] border border-[#E5E5E2] dark:border-neutral-800'
                              : 'bg-[#800000] text-white hover:bg-[#660000] shadow-xs'
                          }`}
                        >
                          {isDone ? 'Review Evaluation' : 'Evaluate Team →'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
