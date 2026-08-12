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

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        <TeamWorkspaceHeader team={team} />

        {/* Step Indicator — NO border lines */}
        <div className="bg-[#FFFFFF] p-5 flex justify-between items-center font-inter text-xs rounded-3xl shadow-xs">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full font-bold ${step === 1 ? 'bg-[#800000] text-white' : 'bg-[#F7F7F5] text-[#777777]'}`}>
              01 Overview & Specs
            </span>
            <span>→</span>
            <span className={`px-4 py-1.5 rounded-full font-bold ${step === 2 ? 'bg-[#800000] text-white' : 'bg-[#F7F7F5] text-[#777777]'}`}>
              02 Preview & Deliverables
            </span>
            <span>→</span>
            <span className={`px-4 py-1.5 rounded-full font-bold ${step === 3 || isLocked ? 'bg-[#800000] text-white' : 'bg-[#F7F7F5] text-[#777777]'}`}>
              03 Lock & Submit
            </span>
          </div>

          <span className="text-[#800000] font-bold">
            {isLocked ? 'SUBMISSION LOCKED' : 'DRAFT READY'}
          </span>
        </div>

        {isLocked ? (
          <div className="bg-[#FFFFFF] p-8 space-y-4 text-center max-w-2xl mx-auto rounded-3xl shadow-xs">
            <div className="w-12 h-12 bg-[#800000]/10 text-[#800000] flex items-center justify-center rounded-full mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-geist font-bold text-[#111111]">Submission Locked & Submitted!</h2>
            <p className="text-xs text-[#777777] font-inter leading-relaxed">
              Your project deliverables for <span className="font-bold text-[#111111]">{projectName}</span> have been assigned to judges for evaluation.
            </p>
            <div className="pt-4 flex justify-center gap-3 font-inter text-xs">
              <button
                onClick={() => setIsLocked(false)}
                className="px-5 py-2.5 bg-[#F7F7F5] text-[#111111] hover:bg-[#E5E5E2] rounded-full font-bold"
              >
                Unlock Deliverables
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] p-6 space-y-6 rounded-3xl shadow-xs">
            {step === 1 && (
              <div className="space-y-4 text-xs font-inter">
                <h2 className="text-lg font-geist font-bold text-[#111111]">Project Specifications</h2>
                <div className="space-y-1.5">
                  <label className="font-inter text-xs font-bold text-[#777777]">PROJECT TITLE</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-3 bg-[#F7F7F5] border-none text-xs rounded-full outline-none font-inter"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-inter text-xs font-bold text-[#777777]">DESCRIPTION</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-[#F7F7F5] border-none text-xs rounded-2xl outline-none font-inter"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-2 shadow-xs"
                >
                  Next: Deliverables Preview <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 text-xs font-inter">
                <h2 className="text-lg font-geist font-bold text-[#111111]">Deliverable Links</h2>
                <div className="space-y-1.5">
                  <label className="font-inter text-xs font-bold text-[#777777]">GITHUB REPOSITORY URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full p-3 bg-[#F7F7F5] border-none text-xs rounded-full outline-none font-inter"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-inter text-xs font-bold text-[#777777]">LIVE DEMO URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full p-3 bg-[#F7F7F5] border-none text-xs rounded-full outline-none font-inter"
                  />
                </div>
                {errorMsg && (
                  <div className="p-3 bg-[#800000]/10 text-[#800000] rounded-xl text-xs font-bold">
                    {errorMsg}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-[#F7F7F5] text-[#777777] rounded-full font-inter text-xs font-bold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStep2Next}
                    className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-2 shadow-xs"
                  >
                    Next: Final Validation <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs font-inter">
                <h2 className="text-lg font-geist font-bold text-[#111111]">Final Submission Validation</h2>
                <div className="p-5 bg-[#F7F7F5] space-y-2 rounded-2xl font-inter text-xs">
                  <div>Project Title: <span className="font-bold text-[#111111]">{projectName}</span></div>
                  <div>Repository: <span className="font-bold text-[#800000]">{repoUrl}</span></div>
                  <div>Validation Status: <span className="font-bold text-[#800000]">100% COMPLETE</span></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-[#F7F7F5] text-[#777777] rounded-full font-inter text-xs font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-2 shadow-xs"
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
