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
    <div className="w-full bg-[#FFFFFF] border border-[#E5E5E2] rounded-3xl overflow-hidden font-inter shadow-xs">
      {/* Header bar — NO divided lines */}
      <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 bg-[#FFFFFF] border-b border-[#E5E5E2]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-base rounded-full shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-geist font-bold uppercase tracking-wider text-[#111111]">
              LIVE LEADERBOARD STANDINGS
            </h3>
            <p className="text-xs text-[#777777] font-inter">
              UPDATED {lastUpdated}
            </p>
          </div>
        </div>

        {/* Track Filters */}
        <div className="flex items-center gap-3">
          {!isCompact && (
            <div className="hidden sm:flex items-center bg-[#FFFFFF] border border-[#E5E5E2] rounded-full p-1 text-xs font-inter shadow-xs">
              {tracks.map((tr) => (
                <button
                  key={tr}
                  onClick={() => setSelectedTrack(tr)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedTrack === tr
                      ? 'bg-[#111111] text-white font-bold'
                      : 'text-[#777777] hover:text-[#111111]'
                  }`}
                >
                  {tr === 'ALL' ? 'All Tracks' : tr.split(' ')[1]}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-xs font-inter font-bold text-[#777777] hover:text-[#111111] bg-[#FFFFFF] border border-[#E5E5E2] hover:bg-[#F7F7F5] rounded-full transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#800000]' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table — NO divider lines */}
      <div className="overflow-x-auto p-3">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-xs font-inter font-bold uppercase tracking-wider text-[#777777] bg-transparent">
              <th className="py-3 px-5 w-16">RANK</th>
              <th className="py-3 px-5">TEAM / PROJECT</th>
              <th className="py-3 px-5 w-32 text-right">SCORE</th>
              <th className="py-3 px-5 w-28 text-center">TREND</th>
              {!isCompact && <th className="py-3 px-5 hidden md:table-cell">TRACK</th>}
              {!isCompact && <th className="py-3 px-5 hidden lg:table-cell">ACTIVITY</th>}
              <th className="py-3 px-5 w-32 text-center">STATUS</th>
              <th className="py-3 px-5 w-12 text-center"></th>
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
                    index === 0 ? 'bg-[#800000]/10 font-medium' : 'bg-[#FFFFFF] border border-[#E5E5E2] hover:bg-[#F7F7F5]'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-4 px-5 font-inter font-bold text-base text-[#111111] rounded-l-2xl">
                    {index === 0 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-[#800000] text-white rounded-full text-xs font-geist font-bold shadow-xs">
                        01
                      </span>
                    ) : (
                      rankNum
                    )}
                  </td>

                  {/* Team Name & Project */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-geist font-bold text-sm shrink-0">
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-geist font-bold text-base text-[#111111] group-hover:underline flex items-center gap-2">
                          {team.name}
                          {index < 3 && (
                            <span className="text-xs font-inter px-2.5 py-0.5 bg-[#800000] text-white rounded-full font-bold">
                              TOP 3
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#777777] font-inter line-clamp-1 max-w-sm mt-0.5">
                          {team.project.name} — {team.project.tagline}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-4 px-5 text-right font-geist font-extrabold text-lg text-[#111111]">
                    {team.score.toFixed(1)}
                  </td>

                  {/* Trend */}
                  <td className="py-4 px-5 text-center font-inter text-xs">
                    {isTrendUp && (
                      <span className="inline-flex items-center gap-1 text-[#800000] font-bold">
                        <TrendingUp className="w-4 h-4" />
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
