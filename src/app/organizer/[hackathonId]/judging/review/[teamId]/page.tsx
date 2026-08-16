'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { getTeamBySlug, getEvaluation, saveEvaluation } from '@/lib/mockApi';
import { Team, RubricScores } from '@/types';
import { GithubIcon } from '@/components/ui/Icons';
import {
  CheckCircle2,
  Save,
  Globe,
  FileText,
  ArrowLeft,
  Sliders,
  Check,
} from 'lucide-react';

export default function OrganizerTeamEvaluationStudioPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';
  const teamId = (params?.teamId as string) || 'cyberforge';

  const [team, setTeam] = useState<Team | null>(null);
  const [scores, setScores] = useState<RubricScores>({
    innovation: 27,
    technical: 26,
    impact: 17,
    ux: 9,
    presentation: 9,
  });
  const [notes, setNotes] = useState(
    'Exceptional computer vision implementation using YOLOv9 custom TensorRT quantization. The WebSocket live overlay canvas operates smoothly under heavy camera stream load. Would like to see hardware benchmark results on Jetson Orin modules.'
  );
  const [autosavedTime, setAutosavedTime] = useState('04:30:12 IST');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    getTeamBySlug(teamId).then(setTeam);
    getEvaluation(teamId).then((res) => {
      if (res) {
        setScores(res.scores);
        setNotes(res.notes);
        if (res.updatedAt) setAutosavedTime(res.updatedAt);
      }
    });
  }, [teamId]);

  const totalScore =
    scores.innovation +
    scores.technical +
    scores.impact +
    scores.ux +
    scores.presentation;

  const handleScoreChange = (key: keyof RubricScores, value: number) => {
    const updated = { ...scores, [key]: value };
    setScores(updated);
    triggerAutosave(updated, notes);
  };

  const triggerAutosave = (currScores: RubricScores, currNotes: string) => {
    setIsSaving(true);
    saveEvaluation(teamId, currScores, currNotes, 'SAVED').then((res) => {
      setIsSaving(false);
      setAutosavedTime(res.updatedAt);
    });
  };

  const handleFinalSubmit = () => {
    setIsSaving(true);
    saveEvaluation(teamId, scores, notes, 'SUBMITTED').then((res) => {
      setIsSaving(false);
      setIsSubmitted(true);
      setAutosavedTime(res.updatedAt);
    });
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
        <OrganizerSidebar hackathonId={hackathonId} />
        <div className="flex-1 flex items-center justify-center p-12 text-xs font-mono text-[#666666]">
          Loading Evaluation Studio...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <Link
              href={`/organizer/${hackathonId}/judging`}
              className="inline-flex items-center gap-1.5 text-xs text-[#777777] hover:text-[#111111] dark:hover:text-white font-inter font-semibold mb-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#800000]" /> Back to Assigned Queue
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">{team.name}</h1>
              <span className="font-inter text-xs font-bold text-[#800000] bg-[#800000]/10 px-3 py-1 rounded-full">
                {team.track}
              </span>
            </div>
          </div>

          {/* Total Score & Autosave Indicator */}
          <div className="flex items-center gap-4 bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 px-5 py-3 rounded-2xl font-inter shadow-xs">
            <div className="text-right">
              <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold tracking-wider">EVALUATION TOTAL</div>
              <div className="text-2xl font-extrabold font-geist text-[#800000]">{totalScore} / 100</div>
            </div>
            <div className="text-xs text-[#777777] dark:text-neutral-400 font-medium">
              {isSaving ? (
                <span className="text-[#800000] font-bold">AUTOSAVING...</span>
              ) : (
                <span className="text-[#800000] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#800000]" /> SAVED AT {autosavedTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Split View Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-inter">
          
          {/* LEFT SIDE: Project Deliverables & Spec (Col 6) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 space-y-5 font-inter rounded-3xl shadow-xs">
              <div>
                <div className="text-xs text-[#800000] font-mono uppercase font-bold tracking-wider">SUBMISSION DELIVERABLES</div>
                <h2 className="text-xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">{team.project.name}</h2>
                <p className="text-xs text-[#777777] dark:text-neutral-400 mt-0.5">{team.project.tagline}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {team.project.repoUrl && (
                  <a
                    href={team.project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#111111] text-white hover:bg-[#222222] rounded-full font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" /> GitHub Repository
                  </a>
                )}
                {team.project.demoUrl && (
                  <a
                    href={team.project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#F7F7F5] text-[#111111] hover:bg-[#E5E5E2] rounded-full font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-[#800000]" /> Live Demo Link
                  </a>
                )}
                {team.project.presentationUrl && (
                  <a
                    href={team.project.presentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#F7F7F5] text-[#111111] hover:bg-[#E5E5E2] rounded-full font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#800000]" /> Pitch Deck
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-[#777777]">PROJECT ARCHITECTURE SUMMARY</h3>
                <p className="text-xs text-[#111111] leading-relaxed">
                  {team.project.description}
                </p>
              </div>

              {/* Team Roster Specs */}
              <div className="space-y-2 pt-1 text-xs">
                <h3 className="text-xs font-bold uppercase text-[#777777] dark:text-neutral-400">TEAM MEMBERS & ROLES</h3>
                <div className="grid grid-cols-2 gap-2">
                  {team.members.map((m) => (
                    <div key={m.id} className="p-3 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl">
                      <div className="font-bold text-[#111111] dark:text-white">{m.name}</div>
                      <div className="text-[11px] text-[#777777] dark:text-neutral-400">{m.role} • {m.contributionPercentage}% Contrib</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry Stats */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl">
                  <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">COMMITS</div>
                  <div className="font-geist font-bold text-sm text-[#111111] dark:text-white">{team.project.commitsCount}</div>
                </div>
                <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl">
                  <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">PULL REQS</div>
                  <div className="font-geist font-bold text-sm text-[#111111] dark:text-white">{team.project.prsCount}</div>
                </div>
                <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl">
                  <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">ISSUES</div>
                  <div className="font-geist font-bold text-sm text-[#111111] dark:text-white">{team.project.issuesCount}</div>
                </div>
                <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl">
                  <div className="text-[10px] text-[#777777] dark:text-neutral-400 uppercase font-bold">ACTIVE DAYS</div>
                  <div className="font-geist font-bold text-sm text-[#800000]">{team.project.activeDays}</div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: Interactive Rubric Evaluation Studio (Col 6) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 space-y-6 font-inter rounded-3xl shadow-xs">
              
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#800000]" /> OFFICIAL JUDGING RUBRIC
                </h3>
                <span className="text-xs font-bold text-[#800000] bg-[#800000]/10 px-3 py-1 rounded-full">
                  QUANTUM BUILD 2026
                </span>
              </div>

              {/* 5 Rubric Sliders */}
              <div className="space-y-5">
                
                {/* 1. Innovation (0 - 30) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#111111] dark:text-white">INNOVATION &amp; NOVELTY</span>
                    <span className="text-[#800000]">{scores.innovation} / 30</span>
                  </div>
                  <p className="text-[11px] text-[#777777] dark:text-neutral-400">
                    Originality of core IP, unique engineering approach, and competitive differentiation.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={scores.innovation}
                    onChange={(e) => handleScoreChange('innovation', parseInt(e.target.value))}
                    className="w-full accent-[#800000] cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                  />
                </div>

                {/* 2. Technical Complexity (0 - 30) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#111111] dark:text-white">TECHNICAL ARCHITECTURE</span>
                    <span className="text-[#800000]">{scores.technical} / 30</span>
                  </div>
                  <p className="text-[11px] text-[#777777] dark:text-neutral-400">
                    Code quality, sub-system integration, model optimization, and repository structure.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={scores.technical}
                    onChange={(e) => handleScoreChange('technical', parseInt(e.target.value))}
                    className="w-full accent-[#800000] cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                  />
                </div>

                {/* 3. Real-World Impact (0 - 20) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#111111] dark:text-white">REAL-WORLD IMPACT</span>
                    <span className="text-[#800000]">{scores.impact} / 20</span>
                  </div>
                  <p className="text-[11px] text-[#777777] dark:text-neutral-400">
                    Market applicability, scalability, and potential for industry adoption.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={scores.impact}
                    onChange={(e) => handleScoreChange('impact', parseInt(e.target.value))}
                    className="w-full accent-[#800000] cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                  />
                </div>

                {/* 4. UX & Polish (0 - 10) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#111111] dark:text-white">UX &amp; INTERFACE POLISH</span>
                    <span className="text-[#800000]">{scores.ux} / 10</span>
                  </div>
                  <p className="text-[11px] text-[#777777] dark:text-neutral-400">
                    User experience precision, aesthetic clarity, and friction-free interactions.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={scores.ux}
                    onChange={(e) => handleScoreChange('ux', parseInt(e.target.value))}
                    className="w-full accent-[#800000] cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                  />
                </div>

                {/* 5. Presentation (0 - 10) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#111111] dark:text-white">PRESENTATION &amp; DEMO</span>
                    <span className="text-[#800000]">{scores.presentation} / 10</span>
                  </div>
                  <p className="text-[11px] text-[#777777] dark:text-neutral-400">
                    Clarity of video demo, pitch deck quality, and live system demonstration.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={scores.presentation}
                    onChange={(e) => handleScoreChange('presentation', parseInt(e.target.value))}
                    className="w-full accent-[#800000] cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                  />
                </div>

              </div>

              {/* Judge Notes */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#111111] dark:text-white block">
                  JUDGE EVALUATION NOTES
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    triggerAutosave(scores, e.target.value);
                  }}
                  placeholder="Provide feedback on innovation, architecture, edge execution, and performance..."
                  className="w-full p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-[#800000] text-xs font-inter rounded-2xl outline-none text-[#111111] dark:text-white"
                />
              </div>

              {/* Save & Submit Button Bar */}
              <div className="pt-2 flex items-center justify-between text-xs font-inter">
                {isSubmitted ? (
                  <div className="w-full py-3.5 bg-[#16803C] text-white text-center font-bold uppercase rounded-full flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Evaluation Locked &amp; Submitted
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => triggerAutosave(scores, notes)}
                      className="px-5 py-3 bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#111111] font-bold rounded-full transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4 text-[#800000]" /> Save Draft
                    </button>
                    <button
                      onClick={handleFinalSubmit}
                      className="px-7 py-3 bg-[#800000] hover:bg-[#660000] text-white font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm flex items-center gap-2"
                    >
                      Complete &amp; Lock Evaluation →
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
