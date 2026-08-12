'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { ArrowRight, User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-8 max-w-md w-full space-y-6">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-geist font-bold text-[#111111]">
              Create Zapsters Account
            </h1>
            <p className="text-xs text-[#777777]">
              Join the competition infrastructure platform for hackathons.
            </p>
          </div>

          <form action="/auth/onboarding" className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-[#777777] block">FULL NAME</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-[#777777] block">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="email"
                  required
                  placeholder="hacker@zapsters.dev"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-[#777777] block">CREATE PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#800000] hover:bg-[#660000] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              Continue to Onboarding <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E5E5E2] text-center text-xs text-[#777777]">
            Already registered?{' '}
            <Link href="/auth/login" className="text-[#800000] font-bold hover:underline">
              Sign in →
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
