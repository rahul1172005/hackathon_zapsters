'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Shield, LayoutDashboard } from 'lucide-react';
import { AuthRequiredModal } from '@/components/modals/AuthRequiredModal';

export const PublicFooter: React.FC = () => {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const userAuth = localStorage.getItem('zapsters_auth');
      if (userAuth === 'true') {
        router.push('/dashboard');
        return;
      }
    }
    setShowAuthModal(true);
  };

  return (
    <footer className="w-full bg-white dark:bg-black text-[#111111] dark:text-white pt-12 pb-10 font-inter rounded-none mt-12 transition-colors">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10">

        {/* Top CTA Banner inside Footer */}
        <div className="bg-[#F7F7F5] dark:bg-[#0D0D0D] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-3xl flex flex-col gap-5 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-geist font-bold text-[#111111] dark:text-white tracking-tight">
              Ready to build your next hackathon project?
            </h2>
            <p className="text-xs text-neutral-600 dark:text-[#999999] max-w-xl">
              Experience the competition operating system designed for student hackers, engineering teams, and real-time project telemetry.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/explore"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase tracking-wider rounded-full transition-all shadow-md"
            >
              <Search className="w-3.5 h-3.5" /> Explore Competitions
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#111111] hover:bg-neutral-100 text-xs font-inter font-bold uppercase tracking-wider rounded-full transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#800000]" /> Create Student Account
            </Link>
          </div>
        </div>

        {/* Multi-column Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <img
                  src="/images (4)/navbar.png"
                  alt="Logo"
                  loading="lazy"
                  decoding="async"
                  style={{ transform: 'scale(3.5) translate(10px, -2px)' }}
                  className="h-8 w-auto object-contain transition-transform"
                />
              </Link>
            </div>
            <p className="text-xs text-[#999999] max-w-md leading-relaxed">
              The operating system for student hackathons. Providing real-time competition infrastructure for team identity, live telemetry, and project submission.
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

            {/* Column 2: Hacker Workspaces */}
            <div className="space-y-3">
              <h3 className="font-geist font-bold text-sm text-white tracking-wide uppercase">
                Hacker Workspaces
              </h3>
              <ul className="space-y-2 text-[#999999]">
                <li>
                  <button
                    onClick={handleDashboardClick}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#800000]" /> Student Workspace
                  </button>
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
                  <Link href="/auth/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#800000]" /> Credential Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & System */}
            <div className="space-y-3">
              <h3 className="font-geist font-bold text-sm text-white tracking-wide uppercase">
                Platform Rules
              </h3>
              <ul className="space-y-2 text-[#999999]">
                <li>
                  <Link href="/hackathons/quantum-build-2026" className="hover:text-white transition-colors">
                    Code of Conduct
                  </Link>
                </li>
                <li>
                  <Link href="/organizer/quantum-build-2026/judging" className="hover:text-white transition-colors">
                    Judging Rubrics
                  </Link>
                </li>
                <li>
                  <Link href="/hackathons" className="hover:text-white transition-colors">
                    API Telemetry
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom copyright line — NO divided lines */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <div>
            © {new Date().getFullYear()} Platform Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#800000] dark:bg-red-500 animate-pulse" />
              Infrastructure Operational
            </span>
          </div>
        </div>

      </div>

      {/* Hyper-Aesthetic Auth Required Popup Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </footer>
  );
};
