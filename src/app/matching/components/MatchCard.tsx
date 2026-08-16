'use client';

import React from 'react';
import Link from 'next/link';
import { DEFAULT_AVATAR } from '@/lib/auth/roles';
import type { MatchProfile } from '@/lib/matching';
import { ExternalLink, UserPlus } from 'lucide-react';

interface MatchCardProps {
  profile: MatchProfile;
}

export function MatchCard({ profile }: MatchCardProps) {
  const { user, score, matched_skills, matched_interests } = profile;

  return (
    <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl shadow-xs flex flex-col gap-4 hover:border-[#800000]/50 dark:hover:border-[#800000]/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={user.avatar ?? DEFAULT_AVATAR}
            alt={user.name}
            loading="lazy"
            decoding="async"
            className="w-12 h-12 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <Link
              href={`/users/${user.username}`}
              className="text-sm font-geist font-bold text-[#111111] dark:text-white hover:underline truncate block"
            >
              {user.name}
            </Link>
            <div className="text-[11px] text-[#777777] dark:text-neutral-400 truncate">
              {user.title || 'Participant'}
            </div>
            <div className="text-[11px] text-[#999999] dark:text-neutral-500 font-mono">@{user.username}</div>
          </div>
        </div>
        {typeof score === 'number' && (
          <span className="px-3 py-1.5 bg-[#800000] text-white text-xs font-geist font-bold rounded-full shadow-xs shrink-0">
            {score}%
          </span>
        )}
      </div>

      {user.bio && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">{user.bio}</p>
      )}

      {matched_skills.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
            Matched Skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched_skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-[#F7F7F5] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-[#800000] dark:text-red-400 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {matched_interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {matched_interests.map((interest) => (
            <span
              key={interest}
              className="px-2.5 py-1 bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 rounded-lg"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      <div className="pt-3 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <Link
          href={`/users/${user.username}`}
          className="text-xs text-[#800000] dark:text-red-400 font-bold hover:underline flex items-center gap-1"
        >
          View Profile <ExternalLink className="w-3 h-3" />
        </Link>
        <Link
          href="/teams"
          className="px-4 py-2 bg-[#800000] hover:bg-[#660000] text-white text-[11px] font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" /> Invite
        </Link>
      </div>
    </div>
  );
}
