'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#FFFFFF] border border-[#E5E5E2] p-8 max-w-md w-full space-y-6">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-geist font-bold text-[#111111]">
              Sign in to Zapsters
            </h1>
            <p className="text-xs text-[#777777]">
              Enter your credentials to access your hacker or organizer workspace.
            </p>
          </div>

          <form action="/dashboard" className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-[#777777] block">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="email"
                  required
                  placeholder="hacker@zapsters.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[10px] font-bold text-[#777777]">PASSWORD</label>
                <a href="#" className="text-[10px] text-[#800000] hover:underline font-mono">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E2] focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#800000] hover:bg-[#660000] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              Sign In to Operating System <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E5E5E2] text-center text-xs text-[#777777]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#800000] font-bold hover:underline">
              Create an account →
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
