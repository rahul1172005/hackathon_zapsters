'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, X } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Card Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-[#E5E5E2] dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(128,0,0,0.25)] overflow-hidden font-inter transition-all transform animate-in zoom-in-95 duration-200 text-[#111111] dark:text-white">
        
        {/* Ambient Glowing Background Accents */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#800000]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#800000]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#777777] hover:text-[#111111] dark:hover:text-white flex items-center justify-center transition-all hover:rotate-90 cursor-pointer z-10"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="relative z-10 space-y-6">
          
          {/* Header Section */}
          <div className="flex items-start gap-4 pt-1">
            <div className="w-13 h-13 shrink-0 bg-gradient-to-br from-[#800000]/15 to-[#800000]/5 border border-[#800000]/20 rounded-2xl flex items-center justify-center text-[#800000] shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-geist font-light tracking-tight text-[#111111] dark:text-white leading-tight">
                Sign In to Workspace
              </h2>
              <p className="text-xs text-[#777777] dark:text-neutral-400 leading-relaxed font-inter">
                Access your student hacker workspace, manage team rosters, and track live competition telemetry.
              </p>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="space-y-3 pt-2">
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
    </div>
  );
};
