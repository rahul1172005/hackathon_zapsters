'use client';

import React from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { MOCK_TEAMS } from '@/lib/mockData';
import { GithubIcon } from '@/components/ui/Icons';
import { Terminal } from 'lucide-react';

export default function MyProjectsPage() {
  const project = MOCK_TEAMS[2].project; // Sentinel Vision

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              HACKER WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">Project Workspace</h1>
          </div>

          <Link
            href="/dashboard/submission"
            className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-geist font-bold uppercase rounded-full transition-colors shadow-xs self-start sm:self-auto"
          >
            Edit Submission Form →
          </Link>
        </div>

        {/* Project Details Box — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 sm:p-8 space-y-6 rounded-3xl shadow-xs font-inter">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-geist font-bold text-[#111111] dark:text-white">{project.name}</h2>
                <span className="font-mono text-[10px] text-[#800000] bg-[#800000]/10 border border-[#800000]/20 px-3 py-1 rounded-full font-bold">
                  GITHUB SYNC ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#777777] dark:text-neutral-400 mt-0.5">{project.tagline}</p>
            </div>

            <div className="flex items-center gap-2 font-inter text-xs">
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-bold rounded-full shadow-2xs"
              >
                <GithubIcon className="w-4 h-4" />
                <span>{project.repoUrl.replace('https://github.com/', '')}</span>
              </a>
            </div>
          </div>

          <div className="space-y-2 font-inter">
            <h3 className="text-xs font-mono font-bold uppercase text-[#800000]">PROJECT ARCHITECTURE & SUMMARY</h3>
            <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed max-w-4xl">
              {project.description}
            </p>
          </div>

          {/* Tech Stack Badges */}
          <div className="space-y-2 pt-1 font-inter">
            <h3 className="text-xs font-mono font-bold uppercase text-[#800000]">REGISTERED TECH STACK</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-3 py-1 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-neutral-200 font-medium rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* README Preview Box */}
          <div className="space-y-2 pt-2 font-inter">
            <h3 className="text-xs font-mono font-bold uppercase text-[#800000] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#800000]" /> README.md SYNC PREVIEW
            </h3>
            <div className="p-5 bg-[#111111] text-white font-mono text-xs space-y-2 rounded-2xl shadow-inner">
              <div className="text-neutral-300 font-bold"># Sentinel — Industrial Threat Detection</div>
              <div className="text-neutral-400">
                Sentinel uses YOLOv9 vision models with TensorRT optimization for real-time factory hazard alerts.
              </div>
              <div className="text-neutral-500 pt-2">
                pip install -r requirements.txt &amp;&amp; python main.py --stream
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
