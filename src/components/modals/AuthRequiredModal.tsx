'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Lock, ArrowRight, X } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Card Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-[#E5E5E2] dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(128,0,0,0.4)] overflow-hidden font-inter transition-all transform animate-in zoom-in-95 duration-200 text-[#111111] dark:text-white my-auto mx-auto">
        
        {/* Ambient Glowing Background Accents */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#800000]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#800000]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#777777] hover:text-[#111111] dark:hover:text-white flex items-center justify-center transition-all hover:rotate-90 cursor-pointer z-10"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="relative z-10 space-y-6 flex flex-col items-center text-center pt-2">
          
          {/* Header Section */}
          <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-[#800000]/20 to-[#800000]/5 border border-[#800000]/30 rounded-2xl flex items-center justify-center text-[#800000] dark:text-red-400 shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl sm:text-3xl font-geist font-bold tracking-tight text-[#111111] dark:text-white leading-tight">
              Sign In to Workspace
            </h2>
            <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed font-inter">
              Access your student hacker workspace, manage team rosters, and track live competition telemetry.
            </p>
          </div>

          {/* Action CTA Buttons */}
          <div className="w-full space-y-3 pt-2">
            <Link
              href="/auth/login"
              onClick={onClose}
              className="w-full py-3.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign In to Workspace <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth/register"
              onClick={onClose}
              className="w-full py-3 bg-[#FFFFFF] dark:bg-neutral-900 text-[#111111] dark:text-white hover:bg-[#F7F7F5] dark:hover:bg-neutral-800 text-xs font-bold rounded-full transition-all flex items-center justify-center border border-[#E5E5E2] dark:border-neutral-800 cursor-pointer shadow-2xs"
            >
              Create Student Account →
            </Link>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

