'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const PublicNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

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

        {/* Center: Nav Menu Links — desktop only */}
        <nav
          style={{ transform: 'translate(calc(-200% + 0px), 1px)' }}
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#777777] dark:text-neutral-400 absolute left-1/2 transition-transform"
        >
          <Link href="/explore" className="hover:text-[#111111] dark:hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/hackathons/quantum-build-2026" className="hover:text-[#111111] dark:hover:text-white transition-colors">
            Hackathons
          </Link>
          <Link href="/leaderboard" className="hover:text-[#111111] dark:hover:text-white transition-colors">
            Leaderboard
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <ThemeToggle />

          {/* Desktop CTA buttons */}
          <Link
            href="/auth/login"
            className="hidden sm:inline text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
          >
            Sign in
          </Link>

          <Link
            href="/auth/register"
            className="hidden sm:inline text-white bg-[#800000] hover:bg-[#660000] px-5 py-2 rounded-full font-bold transition-colors shadow-xs"
          >
            Get started
          </Link>

          <Link
            href="/dashboard"
            className="hidden lg:flex items-center gap-2 text-[#111111] dark:text-white bg-[#F7F7F5] dark:bg-black hover:bg-[#E5E5E2] dark:hover:bg-neutral-900 border border-transparent dark:border-neutral-800 px-4 py-2 rounded-full font-semibold transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-[#800000]" />
            Dashboard
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-[#F0F0EE] dark:bg-neutral-900 text-[#111111] dark:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-50 bg-[#F7F7F5] dark:bg-black border-t border-[#E5E5E2] dark:border-neutral-800 shadow-xl px-4 py-5 space-y-3 font-inter">
          <Link
            href="/explore"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#111111] dark:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-900 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/hackathons/quantum-build-2026"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#111111] dark:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-900 transition-colors"
          >
            Hackathons
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#111111] dark:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-900 transition-colors"
          >
            Leaderboard
          </Link>

          <div className="border-t border-[#E5E5E2] dark:border-neutral-800 pt-3 flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="block text-center px-4 py-3 rounded-full text-sm font-medium text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white border border-[#E5E5E2] dark:border-neutral-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="block text-center px-4 py-3 rounded-full text-sm font-bold text-white bg-[#800000] hover:bg-[#660000] transition-colors"
            >
              Get started
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-[#111111] dark:text-white bg-[#F0F0EE] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#800000]" />
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
