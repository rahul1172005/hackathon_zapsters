'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F9F9F8] dark:bg-black px-4 py-24 text-center font-inter">
      <span className="inline-flex items-center rounded-3xl border border-[#800000]/20 bg-[#800000]/5 px-4 py-2 text-xs font-geist font-bold uppercase tracking-[0.3em] text-[#800000]">
        Unexpected Error
      </span>

      <h1 className="mt-8 text-5xl sm:text-7xl lg:text-8xl font-geist font-light tracking-tight text-[#111111] dark:text-white">
        Something Went Wrong
      </h1>

      <p className="mt-5 max-w-md text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
        An unexpected error occurred while rendering this page. It could be temporary — try again,
        or head back home.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={retry}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#800000] hover:bg-[#660000] text-white text-sm font-geist font-bold uppercase tracking-wider rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#111111] dark:text-white text-sm font-geist font-bold uppercase tracking-wider rounded-full transition-all border border-[#E5E5E2] dark:border-neutral-700"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
