'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { ArrowRight, User, Mail, Lock, AtSign } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
      });
      router.push('/auth/onboarding');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-inter">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-8 max-w-md w-full space-y-6 rounded-3xl shadow-xs font-inter">

          <div className="space-y-1">
            <h1 className="text-3xl font-geist font-bold text-[#111111] dark:text-white">
              Create Zapsters Account
            </h1>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
              Join the competition infrastructure platform for hackathons.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-inter">
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-[#777777] block">FULL NAME</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors dark:text-white"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-[#777777] block">USERNAME</label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={64}
                  pattern="[a-zA-Z0-9_]+"
                  title="Letters, numbers and underscores only"
                  placeholder="rahul_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors font-mono dark:text-white"
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
                  minLength={8}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#800000] hover:bg-[#660000] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? 'Creating Account…' : 'Continue to Onboarding'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>

            {error && (
              <p className="text-[11px] text-red-500 dark:text-red-400 font-medium text-center">
                {error}
              </p>
            )}
          </form>

          <div className="pt-2 text-center text-xs text-[#777777] dark:text-neutral-400 font-inter">
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
