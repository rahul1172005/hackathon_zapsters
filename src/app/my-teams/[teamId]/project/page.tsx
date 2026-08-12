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
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        <TeamWorkspaceHeader team={team} />

        <div className="bg-[#FFFFFF] p-6 space-y-6 rounded-3xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="text-2xl font-geist font-bold text-[#111111]">{project.name}</h2>
              <p className="text-xs font-inter text-[#777777] mt-0.5">{project.tagline}</p>
            </div>

            <div className="flex items-center gap-2 font-inter text-xs">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#111111] text-white hover:bg-[#222222] rounded-full flex items-center gap-1.5 font-bold"
                >
                  <GithubIcon className="w-4 h-4" /> Repository
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#800000] text-white hover:bg-[#660000] rounded-full flex items-center gap-1.5 font-bold"
                >
                  <Globe className="w-4 h-4" /> Live Demo
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-inter font-bold uppercase text-[#777777]">EXECUTIVE ARCHITECTURE SPECIFICATION</h3>
            <p className="text-xs text-[#111111] leading-relaxed max-w-4xl font-inter">{project.description}</p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-inter font-bold uppercase text-[#777777]">REGISTERED TECH STACK</h3>
            <div className="flex flex-wrap gap-2 font-inter text-xs">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-3.5 py-1.5 bg-[#F7F7F5] text-[#111111] rounded-full font-semibold">
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
