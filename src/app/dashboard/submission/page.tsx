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
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <ParticipantSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              HACKATHON DELIVERABLES
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Project Submission Portal</h1>
          </div>

          <div className="font-mono text-xs text-[#666666] bg-[#FFFFFF] border border-[#E5E5E2] px-3 py-1.5 rounded-xs">
            COMPETITION: QUANTUM BUILD 2026
          </div>
        </div>

        {isSubmitted ? (
          <div className="bg-[#FFFFFF] border border-[#16803C] p-8 space-y-4 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-[#16803C]/10 text-[#16803C] flex items-center justify-center rounded-full mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">Project Submitted Successfully!</h2>
            <p className="text-xs text-[#666666] font-mono leading-relaxed">
              Your deliverables for <span className="font-bold text-[#111111]">{projectName}</span> have been locked and assigned for evaluation in track <span className="font-bold text-[#111111]">{selectedTrack}</span>.
            </p>
            <div className="pt-4 flex justify-center gap-3 font-mono text-xs">
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2 bg-[#FFFFFF] border border-[#E5E5E2] text-[#111111] hover:bg-[#F7F7F5] rounded-xs"
              >
                Edit Deliverables
              </button>
              <Link
                href="/my-teams/team-003/overview"
                className="px-4 py-2 bg-[#111111] text-white font-bold rounded-xs"
              >
                View Live Team Profile →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#E5E5E2] pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#111111]">
                STEP 1: PROJECT SPECIFICATIONS
              </h2>
              <span className="text-[10px] font-mono text-[#16803C]">100% VALIDATED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-[#666666]">PROJECT TITLE</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#111111] font-mono text-xs rounded-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-[#666666]">COMPETITION TRACK</label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#111111] font-mono text-xs rounded-xs outline-none"
                >
                  <option>01 AI Infrastructure</option>
                  <option>02 Computer Vision</option>
                  <option>03 Robotics & Civil Tech</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-mono text-[10px] font-bold text-[#666666]">ONE-LINE TAGLINE</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#111111] font-mono text-xs rounded-xs outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-mono text-[10px] font-bold text-[#666666]">DETAILED DESCRIPTION & ARCHITECTURE</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#111111] text-xs rounded-xs outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-[#E5E5E2] pt-4 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#111111]">
                STEP 2: DELIVERABLES & REPOSITORY LINKS
              </h2>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-[#666666] flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5 text-[#111111]" /> GITHUB REPOSITORY URL (REQUIRED)
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#111111] font-mono text-xs rounded-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-[#666666] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#111111]" /> LIVE DEMO / DEPLOYMENT URL
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#111111] font-mono text-xs rounded-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-[#666666] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#111111]" /> PRESENTATION PITCH DECK URL
                </label>
                <input
                  type="url"
                  value={presentationUrl}
                  onChange={(e) => setPresentationUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#111111] font-mono text-xs rounded-xs outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5E2] flex items-center justify-between">
              <div className="font-mono text-[10px] text-[#666666]">
                STATUS: READY TO SUBMIT
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2"
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
