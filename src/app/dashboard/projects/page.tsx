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
    <div className="min-h-screen bg-[#F7F7F5] flex font-sans">
      <ParticipantSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-5">
          <div>
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest">
              HACKER WORKSPACE
            </div>
            <h1 className="text-2xl font-bold text-[#111111] mt-0.5">Project Workspace</h1>
          </div>

          <Link
            href="/dashboard/submission"
            className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white text-xs font-mono font-bold uppercase rounded-xs transition-colors"
          >
            Edit Submission Form →
          </Link>
        </div>

        {/* Project Details Box */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E5E2] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#111111]">{project.name}</h2>
                <span className="font-mono text-[10px] text-[#16803C] bg-[#16803C]/10 border border-[#16803C]/20 px-2 py-0.5 rounded-xs">
                  GITHUB SYNC ACTIVE
                </span>
              </div>
              <p className="text-xs font-mono text-[#666666] mt-0.5">{project.tagline}</p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white hover:bg-[#222222] rounded-xs"
              >
                <GithubIcon className="w-4 h-4" />
                <span>{project.repoUrl.replace('https://github.com/', '')}</span>
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-[#666666]">PROJECT ARCHITECTURE & SUMMARY</h3>
            <p className="text-xs text-[#111111] leading-relaxed max-w-4xl">
              {project.description}
            </p>
          </div>

          {/* Tech Stack Badges */}
          <div className="space-y-2 pt-2 border-t border-[#E5E5E2]">
            <h3 className="text-xs font-mono font-bold uppercase text-[#666666]">REGISTERED TECH STACK</h3>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-2.5 py-1 bg-[#F7F7F5] border border-[#E5E5E2] text-[#111111] rounded-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* README Preview Box */}
          <div className="space-y-2 pt-4 border-t border-[#E5E5E2]">
            <h3 className="text-xs font-mono font-bold uppercase text-[#666666] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#111111]" /> README.md SYNC PREVIEW
            </h3>
            <div className="p-4 bg-[#111111] text-white font-mono text-xs space-y-2 rounded-xs">
              <div className="text-[#999999]"># Sentinel — Industrial Threat Detection</div>
              <div className="text-neutral-300">
                Sentinel uses YOLOv9 vision models with TensorRT optimization for real-time factory hazard alerts.
              </div>
              <div className="text-neutral-400">
                ```bash<br />
                pip install -r requirements.txt<br />
                python main.py --stream rtsp://192.168.1.100/feed<br />
                ```
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
