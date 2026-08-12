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
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              COMPETITION AUDIT
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Submission Review Grid</h1>
          </div>

          <div className="font-mono text-xs text-[#16803C] bg-[#FFFFFF] border border-[#E5E5E2] px-3 py-1.5 rounded-xs">
            163 / 186 SUBMITTED (87%)
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-4 flex justify-between items-center font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#666666]">FILTER TRACK:</span>
            {['ALL', '01 AI Infrastructure', '02 Computer Vision', '03 Robotics & Civil Tech'].map((tr) => (
              <button
                key={tr}
                onClick={() => setSelectedTrack(tr)}
                className={`px-2.5 py-1 rounded-xs transition-colors ${
                  selectedTrack === tr
                    ? 'bg-[#111111] text-white font-semibold'
                    : 'bg-[#F7F7F5] border border-[#E5E5E2] text-[#666666]'
                }`}
              >
                {tr === 'ALL' ? 'All Tracks' : tr.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions Grid */}
        <div className="space-y-4">
          {filtered.map((sub) => (
            <div key={sub.id} className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-4 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E2] pb-3">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-[#111111] uppercase">{sub.teamName}</span>
                    <span className="text-[#666666]">• {sub.track}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] mt-0.5">{sub.projectName}</h3>
                  <p className="text-xs font-mono text-[#666666]">{sub.tagline}</p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#111111] text-white rounded-xs flex items-center gap-1"
                  >
                    <GithubIcon className="w-3.5 h-3.5" /> Repository
                  </a>
                  {sub.demoUrl && (
                    <a
                      href={sub.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#F7F7F5] border border-[#E5E5E2] text-[#111111] rounded-xs flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" /> Demo
                    </a>
                  )}
                  <Link
                    href={`/judge/review/${sub.teamSlug}`}
                    className="px-3 py-1.5 bg-[#16803C] text-white font-bold rounded-xs flex items-center gap-1"
                  >
                    Evaluate Team →
                  </Link>
                </div>
              </div>

              <p className="text-xs text-[#666666] leading-relaxed max-w-4xl">{sub.description}</p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-mono text-xs border-t border-[#E5E5E2]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#666666]">STACK:</span>
                  {sub.techStack.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 bg-[#F7F7F5] border border-[#E5E5E2] text-[#111111] rounded-xs text-[11px]">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#666666]">EVALUATIONS: {sub.evaluationCount} COMPLETED</span>
                  <span className="font-bold text-[#111111]">AVG SCORE: {sub.averageScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
