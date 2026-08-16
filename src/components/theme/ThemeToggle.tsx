'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('zapsters_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        setIsDark(initialDark);
        if (initialDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('zapsters_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('zapsters_theme', 'light');
    }
  };

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full bg-[#F0F0EE] dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 shrink-0" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Light and Dark Mode"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative w-16 h-8 rounded-full p-1 flex items-center justify-between cursor-pointer transition-all duration-300 select-none group shrink-0 ${
        isDark
          ? 'bg-[#181818] shadow-[inset_3px_3px_6px_#0d0d0d,inset_-3px_-3px_6px_#232323] border border-neutral-800'
          : 'bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,1)] border border-neutral-200'
      }`}
    >
      {/* Background Icon Track Indicators */}
      <span
        className={`w-6 h-6 flex items-center justify-center pl-0.5 transition-colors ${
          isDark ? 'text-neutral-500' : 'text-neutral-700'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span
        className={`w-6 h-6 flex items-center justify-center pr-0.5 transition-colors ${
          isDark ? 'text-neutral-400' : 'text-neutral-400'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </span>

      {/* Sliding Tactile Neumorphic Knob */}
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ease-spring ${
          isDark
            ? 'translate-x-8 bg-[#262626] text-white shadow-[2px_2px_5px_#0a0a0a,-2px_-2px_5px_#333333]'
            : 'translate-x-0 bg-white text-[#111111] shadow-[2px_2px_5px_rgba(0,0,0,0.18)] border border-neutral-200'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-white transition-transform duration-500 rotate-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-[#111111] transition-transform duration-500 rotate-180" />
        )}
      </span>
    </button>
  );
};
