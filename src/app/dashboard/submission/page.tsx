'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { MOCK_TEAMS } from '@/lib/mockData';
import { GithubIcon } from '@/components/ui/Icons';
import { Send, CheckCircle2, Globe, FileText } from 'lucide-react';

export default function ProjectSubmissionPage() {
  const defaultProj = MOCK_TEAMS[2].project;

  const [projectName, setProjectName] = useState(defaultProj.name);
  const [tagline, setTagline] = useState(defaultProj.tagline);
  const [description, setDescription] = useState(defaultProj.description);
  const [repoUrl, setRepoUrl] = useState(defaultProj.repoUrl);
  const [demoUrl, setDemoUrl] = useState(defaultProj.demoUrl);
  const [presentationUrl, setPresentationUrl] = useState(defaultProj.presentationUrl);
  const [selectedTrack, setSelectedTrack] = useState('02 Computer Vision');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              HACKATHON DELIVERABLES
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">Project Submission Portal</h1>
          </div>

          <div className="font-mono text-xs text-[#800000] bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 px-4 py-2 rounded-full font-bold shadow-2xs self-start sm:self-auto">
            COMPETITION: QUANTUM BUILD 2026
          </div>
        </div>

        {isSubmitted ? (
          <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#800000] p-8 space-y-4 text-center max-w-2xl mx-auto rounded-3xl shadow-xs font-inter">
            <div className="w-12 h-12 bg-[#800000]/10 text-[#800000] flex items-center justify-center rounded-2xl mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-geist font-bold text-[#111111] dark:text-white">Project Submitted Successfully!</h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed font-inter">
              Your deliverables for <span className="font-bold text-[#111111] dark:text-white">{projectName}</span> have been locked and assigned for evaluation in track <span className="font-bold text-[#800000]">{selectedTrack}</span>.
            </p>
            <div className="pt-4 flex justify-center gap-3 text-xs font-inter font-bold">
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-5 py-2.5 bg-[#FFFFFF] dark:bg-black border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white hover:bg-[#F7F7F5] rounded-full transition-colors cursor-pointer"
              >
                Edit Deliverables
              </button>
              <Link
                href="/my-teams/team-003/overview"
                className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-full shadow-xs cursor-pointer"
              >
                View Live Team Profile →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 space-y-6 rounded-3xl shadow-xs font-inter">
            
            {/* Step 1 Header — NO divided lines */}
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#800000]">
                STEP 1: PROJECT SPECIFICATIONS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-inter">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 uppercase block">PROJECT NAME</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full py-2.5 px-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 uppercase block">TAGLINE</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full py-2.5 px-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 uppercase block">FULL PROJECT DESCRIPTION</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] text-xs rounded-2xl outline-none text-[#111111] dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Step 2 Header — NO divided lines */}
            <div className="pt-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#800000]">
                STEP 2: DELIVERABLES & REPOSITORY LINKS
              </h2>
            </div>

            <div className="space-y-4 text-xs font-inter">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5 text-[#800000]" /> GITHUB REPOSITORY URL (REQUIRED)
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full py-2.5 px-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] font-mono text-xs rounded-full outline-none text-[#111111] dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#800000]" /> LIVE DEMO / DEPLOYMENT URL
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full py-2.5 px-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] font-mono text-xs rounded-full outline-none text-[#111111] dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#800000]" /> PRESENTATION PITCH DECK URL
                </label>
                <input
                  type="url"
                  value={presentationUrl}
                  onChange={(e) => setPresentationUrl(e.target.value)}
                  className="w-full py-2.5 px-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] font-mono text-xs rounded-full outline-none text-[#111111] dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between font-inter text-xs">
              <div className="font-mono text-[10px] text-[#800000] font-bold">
                STATUS: READY TO SUBMIT
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#800000] hover:bg-[#660000] text-white text-xs font-geist font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" /> Lock & Submit Project
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}
