'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { TeamWorkspaceHeader } from '@/components/navigation/TeamWorkspaceHeader';
import { MOCK_TEAMS } from '@/lib/mockData';
import { GithubIcon } from '@/components/ui/Icons';
import { Globe } from 'lucide-react';

export default function TeamProjectCaseStudyPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const team = MOCK_TEAMS.find((t) => t.id === teamId || t.slug === teamId) || MOCK_TEAMS[2];
  const project = team.project;

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        <TeamWorkspaceHeader team={team} />

        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 sm:p-6 space-y-6 rounded-3xl shadow-xs font-inter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="text-2xl font-geist font-bold text-[#111111] dark:text-white">{project.name}</h2>
              <p className="text-xs font-inter text-[#777777] dark:text-neutral-400 mt-0.5">{project.tagline}</p>
            </div>

            <div className="flex items-center gap-2 font-inter text-xs">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-black hover:bg-[#222222] dark:hover:bg-neutral-200 rounded-full flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4" /> Repository
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#800000] text-white hover:bg-[#660000] rounded-full flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4" /> Live Demo
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-inter font-bold uppercase text-[#777777] dark:text-neutral-400">EXECUTIVE ARCHITECTURE SPECIFICATION</h3>
            <p className="text-xs text-[#111111] dark:text-neutral-200 leading-relaxed max-w-4xl font-inter">{project.description}</p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-inter font-bold uppercase text-[#777777] dark:text-neutral-400">REGISTERED TECH STACK</h3>
            <div className="flex flex-wrap gap-2 font-inter text-xs">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-3.5 py-1.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white rounded-full font-semibold">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
