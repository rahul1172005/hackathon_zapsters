'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { getSubmissions } from '@/lib/mockApi';
import { Submission } from '@/types';
import { GithubIcon } from '@/components/ui/Icons';
import { Globe } from 'lucide-react';

export default function SubmissionsReviewPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('ALL');

  useEffect(() => {
    getSubmissions(hackathonId).then(setSubmissions);
  }, [hackathonId]);

  const filtered = submissions.filter(
    (s) => selectedTrack === 'ALL' || s.track === selectedTrack
  );

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              COMPETITION AUDIT
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Submission Review Grid
            </h1>
          </div>

          <div className="font-mono text-xs text-[#800000] bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 px-4 py-2 rounded-full font-bold shadow-2xs self-start sm:self-auto">
            163 / 186 SUBMITTED (87%)
          </div>
        </div>

        {/* Filter Bar — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-4 font-inter text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 uppercase mr-1">
              FILTER TRACK:
            </span>
            {['ALL', '01 AI Infrastructure', '02 Computer Vision', '03 Robotics & Civil Tech'].map((tr) => (
              <button
                key={tr}
                onClick={() => setSelectedTrack(tr)}
                className={`px-3.5 py-1.5 rounded-full transition-colors font-medium cursor-pointer ${
                  selectedTrack === tr
                    ? 'bg-[#800000] text-white font-bold shadow-xs'
                    : 'bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#777777] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                {tr === 'ALL' ? 'All Tracks' : tr.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions Grid — Curved Corners rounded-3xl, NO Divided Lines */}
        <div className="space-y-4 font-inter">
          {filtered.map((sub) => (
            <div key={sub.id} className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-7 space-y-4 rounded-3xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-[#800000] uppercase">{sub.teamName}</span>
                    <span className="text-[#777777] dark:text-neutral-400">• {sub.track}</span>
                  </div>
                  <h3 className="text-xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">{sub.projectName}</h3>
                  <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">{sub.tagline}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-inter text-xs">
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-bold rounded-full flex items-center gap-1.5 shadow-2xs"
                  >
                    <GithubIcon className="w-3.5 h-3.5" /> Repository
                  </a>
                  {sub.demoUrl && (
                    <a
                      href={sub.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white font-bold rounded-full flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#800000]" /> Demo
                    </a>
                  )}
                  <Link
                    href={`/judge/review/${sub.teamSlug}`}
                    className="px-4 py-2 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-full flex items-center gap-1.5 shadow-xs"
                  >
                    Evaluate Team →
                  </Link>
                </div>
              </div>

              <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed max-w-4xl">{sub.description}</p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-inter text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[10px] text-[#777777] dark:text-neutral-400 font-bold uppercase">STACK:</span>
                  {sub.techStack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-neutral-200 rounded-full text-[11px] font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-[#777777] dark:text-neutral-400">EVALUATIONS: {sub.evaluationCount} COMPLETED</span>
                  <span className="font-bold text-[#800000]">AVG SCORE: {sub.averageScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
