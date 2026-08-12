'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Cpu, Shield, LayoutDashboard } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#111111] text-white pt-12 pb-10 font-inter rounded-none mt-12">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10">

        {/* Top CTA Banner inside Footer */}
        <div className="bg-[#1A1A1A] p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-geist font-bold text-white tracking-tight">
              Ready to host or build your next hackathon?
            </h2>
            <p className="text-xs text-[#999999] max-w-xl">
              Experience the competition infrastructure platform designed for organizers, hackers, and judges.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/explore"
              className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase tracking-wider rounded-full transition-all shadow-md flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5" /> Explore Competitions
            </Link>
            <Link
              href="/organizer/quantum-build-2026/overview"
              className="px-5 py-2.5 bg-white text-[#111111] hover:bg-neutral-100 text-xs font-inter font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2"
            >
              <Cpu className="w-3.5 h-3.5 text-[#800000]" /> Organizer Command Center
            </Link>
          </div>
        </div>

        {/* Multi-column Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/images (4)/navbar.png"
                alt="Zapsters"
                loading="lazy"
                decoding="async"
                style={{ transform: 'scale(3.5) translate(10px, -2px)' }}
                className="h-8 w-auto object-contain transition-transform"
              />
              <span className="font-geist font-extrabold text-xl tracking-wider text-white">

              </span>
            </div>
            <p className="text-xs text-[#999999] max-w-md leading-relaxed">
              Zapsters is the operating system for hackathons. We provide real-time competition infrastructure for event operations, team identity, live telemetry, and rubric judging.
            </p>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">

            {/* Column 1: Public Platform */}
            <div className="space-y-3">
              <h3 className="font-geist font-bold text-sm text-white tracking-wide uppercase">
                Public Platform
              </h3>
              <ul className="space-y-2 text-[#999999]">
                <li>
                  <Link href="/explore" className="hover:text-white transition-colors">
                    Explore Hackathons
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-white transition-colors">
                    Live Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/hackathons/quantum-build-2026" className="hover:text-white transition-colors">
                    Quantum Build 2026
                  </Link>
                </li>
                <li>
                  <Link href="/users/rahul_dev" className="hover:text-[#800000] transition-colors">
                    Hacker Profile
                  </Link>
                </li>
                <li>
                  <Link href="/organizations/quantum-inst" className="hover:text-white transition-colors">
                    Organization Graph
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Workspaces */}
            <div className="space-y-3">
              <h3 className="font-geist font-bold text-sm text-white tracking-wide uppercase">
                Workspaces
              </h3>
              <ul className="space-y-2 text-[#999999]">
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#800000]" /> Hacker Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/my-teams/team-003/overview" className="hover:text-white transition-colors">
                    Team Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/my-teams/team-003/submission" className="hover:text-white transition-colors">
                    Submission Flow
                  </Link>
                </li>
                <li>
                  <Link href="/organizer/quantum-build-2026/overview" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#800000]" /> Organizer Command Center
                  </Link>
                </li>
                <li>
                  <Link href="/judge/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#800000]" /> Judge Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: System & Security */}
            <div className="space-y-3">
              <h3 className="font-geist font-bold text-sm text-white tracking-wide uppercase">
                System & Security
              </h3>
              <ul className="space-y-2 text-[#999999]">
                <li>
                  <span className="text-[#800000] font-bold">Status: Operational</span>
                </li>
                <li>
                  <span>API Architecture 1.0</span>
                </li>
                <li>
                  <span>GitHub Real-time Sync</span>
                </li>
                <li>
                  <span>Rubric Audit Logs</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Copyright Block */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#777777]">
          <div className="flex items-center gap-2">
            <span className="font-geist font-bold text-white text-xs">ZAPSTERS</span>
            <span>© 2026 Zapsters Platform Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Compliance Audit</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
