'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth, primaryRole, routeForRole } from '@/lib/auth';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const nextParam = searchParams.get('next');
      if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('/auth')) {
        router.push(nextParam);
      } else {
        router.push(routeForRole(primaryRole(user)));
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-8 max-w-md w-full space-y-6 rounded-3xl shadow-xs font-inter">
      <div className="space-y-1">
        <h1 className="text-3xl font-geist font-bold text-[#111111] dark:text-white">
          Sign In to Zapsters
        </h1>
        <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
          Enter your credentials to access your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-inter">
        <div className="space-y-1">
          <label className="font-mono text-[10px] font-bold text-[#777777] uppercase block">
            EMAIL ADDRESS
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] pl-9 pr-4 py-2.5 text-xs rounded-full outline-none transition-colors dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="font-mono text-[10px] font-bold text-[#777777] uppercase">
              PASSWORD
            </label>
            <a href="#" className="text-[10px] text-[#800000] hover:underline font-mono">
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
            <input
              type="password"
              required
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
          {submitting ? 'Signing In…' : 'Sign In to Workspace'}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 font-medium text-center">
            {error}
          </p>
        )}
      </form>

      <div className="pt-2 text-center text-xs text-[#777777] dark:text-neutral-400 font-inter">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-[#800000] font-bold hover:underline">
          Create an account →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-inter">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={<div className="text-xs text-[#777777]">Loading Portal Access...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>
    </div>
  );
}
