'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Team } from '@/types';
import { TeamStatusBadge } from './TeamStatusBadge';
import { ActivityIndicator } from './ActivityIndicator';
import { Trophy, TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw } from 'lucide-react';

interface LiveLeaderboardTableProps {
  teams: Team[];
  isCompact?: boolean;
}

export const LiveLeaderboardTable: React.FC<LiveLeaderboardTableProps> = ({
  teams,
  isCompact = false,
}) => {
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('11:42:18 IST');

  const tracks = ['ALL', '01 AI Infrastructure', '02 Computer Vision', '03 Robotics & Civil Tech'];

  const filteredTeams = teams.filter(
    (t) => selectedTrack === 'ALL' || t.track === selectedTrack
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="w-full bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 rounded-3xl overflow-hidden font-inter shadow-xs">
      {/* Header bar — NO divided lines */}
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#141414]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-base rounded-full shadow-xs shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-geist font-bold uppercase tracking-wider text-[#111111] dark:text-white">
              LIVE LEADERBOARD STANDINGS
            </h3>
            <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
              UPDATED {lastUpdated}
            </p>
          </div>
        </div>

        {/* Track Filters & Refresh */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
          {!isCompact && (
            <div className="flex items-center bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 rounded-full p-1 text-xs font-inter shadow-xs overflow-x-auto no-scrollbar">
              {tracks.map((tr) => (
                <button
                  key={tr}
                  onClick={() => setSelectedTrack(tr)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs transition-colors shrink-0 ${
                    selectedTrack === tr
                      ? 'bg-[#111111] dark:bg-white text-white dark:text-neutral-900 font-bold'
                      : 'text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  {tr === 'ALL' ? 'All Tracks' : tr.split(' ')[1]}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-inter font-bold text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 hover:bg-[#F7F7F5] dark:hover:bg-neutral-800 rounded-full transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-[#800000]' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table — Responsive scrollable table */}
      <div className="overflow-x-auto p-2 sm:p-3">
        <table className="w-full text-left border-separate border-spacing-y-2 min-w-[540px] sm:min-w-full">
          <thead>
            <tr className="text-xs font-inter font-bold uppercase tracking-wider text-[#777777] dark:text-neutral-400 bg-transparent">
              <th className="py-2.5 px-3 sm:px-5 w-12 sm:w-16">RANK</th>
              <th className="py-2.5 px-3 sm:px-5">TEAM / PROJECT</th>
              <th className="py-2.5 px-3 sm:px-5 w-24 sm:w-32 text-right">SCORE</th>
              <th className="py-2.5 px-3 sm:px-5 w-20 sm:w-28 text-center">TREND</th>
              {!isCompact && <th className="py-2.5 px-3 sm:px-5 hidden md:table-cell">TRACK</th>}
              {!isCompact && <th className="py-2.5 px-3 sm:px-5 hidden lg:table-cell">ACTIVITY</th>}
              <th className="py-2.5 px-3 sm:px-5 w-24 sm:w-32 text-center">STATUS</th>
              <th className="py-2.5 px-2 sm:px-5 w-10 sm:w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="text-sm font-inter">
            {filteredTeams.map((team, index) => {
              const rankNum = String(index + 1).padStart(2, '0');
              const isTrendUp = team.scoreTrend.startsWith('+');
              const isTrendDown = team.scoreTrend.startsWith('-');

              return (
                <tr
                  key={team.id}
                  onClick={() => router.push(`/dashboard/teams/${team.slug}`)}
                  className={`group cursor-pointer rounded-2xl transition-all ${
                    index === 0 ? 'bg-[#800000]/10 font-medium' : 'bg-[#FFFFFF] dark:bg-[#1A1A1D] border border-[#E5E5E2] dark:border-neutral-800 hover:bg-[#F7F7F5] dark:hover:bg-neutral-800'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3 sm:py-4 px-3 sm:px-5 font-inter font-bold text-sm sm:text-base text-[#111111] dark:text-white rounded-l-2xl">
                    {index === 0 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-[#800000] text-white rounded-full text-xs font-geist font-bold shadow-xs">
                        01
                      </span>
                    ) : (
                      rankNum
                    )}
                  </td>

                  {/* Team Name & Project */}
                  <td className="py-3 sm:py-4 px-3 sm:px-5">
                    <div className="flex items-center gap-2.5 sm:gap-3.5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#111111] dark:bg-neutral-800 text-white flex items-center justify-center font-geist font-bold text-xs sm:text-sm shrink-0">
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-geist font-bold text-sm sm:text-base text-[#111111] dark:text-white group-hover:underline flex items-center gap-2 truncate">
                          <span>{team.name}</span>
                          {index < 3 && (
                            <span className="text-[10px] font-inter px-2 py-0.5 bg-[#800000] text-white rounded-full font-bold shrink-0">
                              TOP 3
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#777777] dark:text-neutral-400 font-inter line-clamp-1 max-w-sm mt-0.5">
                          {team.project.name} — {team.project.tagline}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3 sm:py-4 px-3 sm:px-5 text-right font-geist font-extrabold text-base sm:text-lg text-[#111111] dark:text-white">
                    {team.score.toFixed(1)}
                  </td>

                  {/* Trend */}
                  <td className="py-3 sm:py-4 px-3 sm:px-5 text-center font-inter text-xs">
                    {isTrendUp && (
                      <span className="inline-flex items-center gap-1 text-[#800000] dark:text-red-400 font-bold">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {team.scoreTrend}
                      </span>
                    )}
                    {isTrendDown && (
                      <span className="inline-flex items-center gap-1 text-neutral-600 font-bold">
                        <TrendingDown className="w-4 h-4" />
                        {team.scoreTrend}
                      </span>
                    )}
                    {!isTrendUp && !isTrendDown && (
                      <span className="inline-flex items-center gap-1 text-[#999999]">
                        <Minus className="w-4 h-4" />
                        —
                      </span>
                    )}
                  </td>

                  {/* Track */}
                  {!isCompact && (
                    <td className="py-4 px-5 hidden md:table-cell text-xs font-inter text-[#777777]">
                      {team.track}
                    </td>
                  )}

                  {/* Activity */}
                  {!isCompact && (
                    <td className="py-4 px-5 hidden lg:table-cell">
                      <ActivityIndicator level={team.activityLevel} />
                    </td>
                  )}

                  {/* Status */}
                  <td className="py-4 px-5 text-center">
                    <TeamStatusBadge status={team.status} />
                  </td>

                  {/* Arrow Link */}
                  <td className="py-4 px-5 text-center text-[#999999] group-hover:text-[#111111] rounded-r-2xl">
                    <ExternalLink className="w-4 h-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
