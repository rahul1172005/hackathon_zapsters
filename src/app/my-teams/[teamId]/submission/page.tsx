'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { TeamWorkspaceHeader } from '@/components/navigation/TeamWorkspaceHeader';
import { MOCK_TEAMS } from '@/lib/mockData';
import { Send, Lock, ArrowRight } from 'lucide-react';

export default function DedicatedSubmissionFlowPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const team = MOCK_TEAMS.find((t) => t.id === teamId || t.slug === teamId) || MOCK_TEAMS[2];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [projectName, setProjectName] = useState(team.project.name);
  const [description, setDescription] = useState(team.project.description);
  const [repoUrl, setRepoUrl] = useState(team.project.repoUrl);
  const [demoUrl, setDemoUrl] = useState(team.project.demoUrl);

  const handleStep2Next = () => {
    if (repoUrl && !repoUrl.startsWith('http://') && !repoUrl.startsWith('https://')) {
      setErrorMsg('Repository URL must start with http:// or https://');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLocked(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        <TeamWorkspaceHeader team={team} />

        {/* Step Indicator */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center font-inter text-xs rounded-3xl shadow-xs gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <span className={`px-3.5 sm:px-4 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap text-xs shrink-0 ${step === 1 ? 'bg-[#800000] text-white' : 'bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] dark:text-neutral-400'}`}>
              01 Specs
            </span>
            <span className="text-neutral-400 shrink-0">→</span>
            <span className={`px-3.5 sm:px-4 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap text-xs shrink-0 ${step === 2 ? 'bg-[#800000] text-white' : 'bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] dark:text-neutral-400'}`}>
              02 Deliverables
            </span>
            <span className="text-neutral-400 shrink-0">→</span>
            <span className={`px-3.5 sm:px-4 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap text-xs shrink-0 ${step === 3 || isLocked ? 'bg-[#800000] text-white' : 'bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] dark:text-neutral-400'}`}>
              03 Lock & Submit
            </span>
          </div>

          <span className="text-[#800000] dark:text-red-400 font-bold">
            {isLocked ? 'SUBMISSION LOCKED' : 'DRAFT READY'}
          </span>
        </div>

        {isLocked ? (
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-8 space-y-4 text-center max-w-2xl mx-auto rounded-3xl shadow-xs">
            <div className="w-12 h-12 bg-[#800000]/10 dark:bg-red-500/20 text-[#800000] dark:text-red-400 flex items-center justify-center rounded-full mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-geist font-bold text-[#111111] dark:text-white">Submission Locked & Submitted!</h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter leading-relaxed">
              Your project deliverables for <span className="font-bold text-[#111111] dark:text-white">{projectName}</span> have been assigned to judges for evaluation.
            </p>
            <div className="pt-4 flex justify-center gap-3 font-inter text-xs">
              <button
                onClick={() => setIsLocked(false)}
                className="px-5 py-2.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 rounded-full font-bold transition-colors cursor-pointer"
              >
                Unlock Deliverables
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 space-y-6 rounded-3xl shadow-xs font-inter">
            {step === 1 && (
              <div className="space-y-6 text-xs font-inter">
                <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">Project Specifications</h2>
                
                <div className="space-y-2">
                  <label className="font-inter text-xs font-bold text-[#777777] dark:text-neutral-400 uppercase tracking-wider block mb-2">
                    PROJECT TITLE
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-3.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white text-xs rounded-full outline-none font-inter focus:border-[#800000]"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="font-inter text-xs font-bold text-[#777777] dark:text-neutral-400 uppercase tracking-wider block mb-2.5">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white text-xs rounded-2xl outline-none font-inter focus:border-[#800000] leading-relaxed"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  Next: Deliverables Preview <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 text-xs font-inter">
                <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">Deliverable Links</h2>
                
                <div className="space-y-2">
                  <label className="font-inter text-xs font-bold text-[#777777] dark:text-neutral-400 uppercase tracking-wider block mb-2">
                    GITHUB REPOSITORY URL
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full p-3.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white text-xs rounded-full outline-none font-inter focus:border-[#800000]"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="font-inter text-xs font-bold text-[#777777] dark:text-neutral-400 uppercase tracking-wider block mb-2">
                    LIVE DEMO URL
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full p-3.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white text-xs rounded-full outline-none font-inter focus:border-[#800000]"
                  />
                </div>
                {errorMsg && (
                  <div className="p-3 bg-[#800000]/10 dark:bg-red-500/20 text-[#800000] dark:text-red-400 rounded-xl text-xs font-bold">
                    {errorMsg}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white rounded-full font-inter text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStep2Next}
                    className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    Next: Final Validation <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs font-inter">
                <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">Final Submission Validation</h2>
                <div className="p-5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 space-y-2 rounded-2xl font-inter text-xs">
                  <div>Project Title: <span className="font-bold text-[#111111] dark:text-white">{projectName}</span></div>
                  <div>Repository: <span className="font-bold text-[#800000] dark:text-red-400">{repoUrl}</span></div>
                  <div>Validation Status: <span className="font-bold text-[#800000] dark:text-red-400">100% COMPLETE</span></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white rounded-full font-inter text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Lock & Submit Project Deliverables
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
