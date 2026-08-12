'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const PublicNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F7F5] dark:bg-black font-inter">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">

        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <img
              src="/images (4)/navbar.png"
              alt="Logo"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{ transform: 'scale(3) translate(12px, -2px)' }}
              className="h-10 w-auto object-contain transition-transform"
            />
          </Link>
        </div>

        {/* Center: Nav Menu Links */}
        <nav
          style={{ transform: 'translate(calc(-200% + 0px), 1px)' }}
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#777777] dark:text-neutral-400 absolute left-1/2 transition-transform"
        >
          <Link
            href="/explore"
            className="hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/hackathons/quantum-build-2026"
            className="hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            Hackathons
          </Link>
          <Link
            href="/leaderboard"
            className="hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />

          <Link
            href="/auth/login"
            className="text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
          >
            Sign in
          </Link>

          <Link
            href="/auth/register"
            className="text-white bg-[#800000] hover:bg-[#660000] px-5 py-2 rounded-full font-bold transition-colors shadow-xs"
          >
            Get started
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 text-[#111111] dark:text-white bg-[#F7F7F5] dark:bg-black hover:bg-[#E5E5E2] dark:hover:bg-neutral-900 border border-transparent dark:border-neutral-800 px-4 py-2 rounded-full font-semibold transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-[#800000]" />
            Dashboard
          </Link>
        </div>

      </div>
    </header>
  );
};
