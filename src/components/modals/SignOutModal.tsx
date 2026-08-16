'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 font-inter">
      <div className="bg-[#FFFFFF] dark:bg-[#141414] max-w-md w-full p-6 sm:p-8 space-y-6 rounded-3xl shadow-2xl border border-[#E5E5E2] dark:border-neutral-800 relative my-auto mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F7F5] dark:bg-neutral-800 text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center shrink-0">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-geist font-bold text-[#111111] dark:text-white">
              Confirm Sign Out
            </h3>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-medium">
              Zapsters Platform Accreditation
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="bg-[#F7F7F5] dark:bg-neutral-900/60 p-4 rounded-2xl border border-[#E5E5E2] dark:border-neutral-800 text-xs text-[#555555] dark:text-neutral-300 space-y-2">
          <p className="font-semibold text-[#111111] dark:text-white text-sm">
            Are you sure you want to sign out?
          </p>
          <p className="leading-relaxed">
            You will be signed out of your current session. You can log back in at any time to access your hackathons, team workspaces, and submissions.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

