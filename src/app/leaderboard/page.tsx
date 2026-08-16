'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/app/seo';

interface HackerLeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  scorePoints: number;
  country: string;
  countryFlag: string;
  status: string;
  rankName: string;
  rankLevel: number;
  rankImage: string;
  rankScale: number;
  rankX: number;
  rankY: number;
}

// Fallback letter avatar component when no profile image exists or image fails to load
const HackerAvatar = ({
  name,
  src,
  sizeClass = 'w-9 h-9 text-sm',
  className = '',
}: {
  name: string;
  src?: string;
  sizeClass?: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const firstLetter = name && name.trim().length > 0 ? name.trim()[0].toUpperCase() : 'U';

  if (!src || imageError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-[#800000] text-white font-geist font-bold flex items-center justify-center border border-neutral-300 dark:border-neutral-700 shrink-0 select-none shadow-xs ${className}`}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImageError(true)}
      className={`${sizeClass} rounded-full object-cover shrink-0 border border-neutral-300 dark:border-neutral-700 ${className}`}
    />
  );
};

// Canonical Shield Ranks System matching /dashboard/rankings with scale, x, and y axis transforms
const SHIELD_RANKS = [
  { level: 1, rank: 'Initiator', image: '/images (4)/16.png', minPoints: 0, scale: 1.05, x: 0, y: 0 },
  { level: 2, rank: 'Oracle', image: '/images (4)/17.png', minPoints: 3000, scale: 1.0, x: 0, y: 0 },
  { level: 3, rank: 'Spartan', image: '/images (4)/18.png', minPoints: 5000, scale: 1.0, x: 0, y: 0 },
  { level: 4, rank: 'Titan', image: '/images (4)/19.png', minPoints: 8000, scale: 1.0, x: 0, y: 0 },
  { level: 5, rank: 'Atlas', image: '/images (4)/20.png', minPoints: 12500, scale: 0.9, x: 0, y: 0 },
  { level: 6, rank: 'Hyperion', image: '/images (4)/21.png', minPoints: 18000, scale: 1.1, x: 0, y: 0 },
  { level: 7, rank: 'Olympian', image: '/images (4)/22.png', minPoints: 25000, scale: 1.17, x: 0, y: 0 },
  { level: 8, rank: 'Primordial', image: '/images (4)/23.png', minPoints: 35000, scale: 1.2, x: 0, y: 0 },
  { level: 9, rank: 'Ascendant', image: '/images (4)/24.png', minPoints: 50000, scale: 1.2, x: 0, y: 0 },
  { level: 10, rank: 'Deus', image: '/images (4)/25.png', minPoints: 80000, scale: 1.3, x: 0, y: 0 },
];

const getRankFromPoints = (points: number) => {
  for (let i = SHIELD_RANKS.length - 1; i >= 0; i--) {
    if (points >= SHIELD_RANKS[i].minPoints) {
      return SHIELD_RANKS[i];
    }
  }
  return SHIELD_RANKS[0];
};

const getPointsForRank = (r: number) => {
  if (r === 1) return 85500; // Deus (LVL.10)
  if (r === 2) return 58360; // Ascendant (LVL.9)
  if (r === 3) return 42220; // Primordial (LVL.8)
  if (r === 4) return 31500; // Olympian (LVL.7)
  if (r === 5) return 22400; // Hyperion (LVL.6)
  if (r === 6) return 16200; // Atlas (LVL.5)
  if (r === 7) return 11000; // Titan (LVL.4)
  if (r === 8) return 6800;  // Spartan (LVL.3)
  if (r === 9) return 4200;  // Oracle (LVL.2)
  return Math.max(800, 3200 - (r - 10) * 25);
};

// Generate 100 realistic global hacker players using dashboard ranking system
const GENERATED_PLAYERS: HackerLeaderboardEntry[] = Array.from({ length: 100 }, (_, index) => {
  const r = index + 1;
  const points = getPointsForRank(r);
  const rankInfo = getRankFromPoints(points);

  const names = [
    'Rahul Sharma', 'Alex Chen', 'Ananya Rao', 'Elena Rostova', 'Marcus Vance',
    'Priya Patel', 'Kenji Takahashi', 'Sophia Mueller', 'Vikramaditya Roy', 'Lucas Silva',
    'Aarav Kumar', 'David Miller', 'Mei Ling', 'Liam O\'Connor', 'Fatima Al-Sayed',
    'Carlos Gomez', 'Zoe Williams', 'Dmitry Ivanov', 'Hiroshi Sato', 'Chloe Dubois',
  ];

  const countries = [
    { name: 'India', flag: '🇮🇳' },
    { name: 'United States', flag: '🇺🇸' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'Singapore', flag: '🇸🇬' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'Brazil', flag: '🇧🇷' },
  ];

  const baseName = names[(r - 1) % names.length];
  const name = r <= 10 ? baseName : `${baseName} ${Math.floor(r / 10)}`;
  const handle = `@${name.toLowerCase().replace(/[^a-z]/g, '')}_${r}`;
  const countryObj = countries[(r - 1) % countries.length];

  // Alternating mock users without avatar image to demonstrate letter profile fallback
  const hasProfileImg = r % 3 !== 0;
  const avatarUrl = hasProfileImg
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=800000&color=fff&size=128&bold=true`
    : '';

  return {
    rank: r,
    name,
    handle,
    avatar: avatarUrl,
    scorePoints: points,
    country: countryObj.name,
    countryFlag: countryObj.flag,
    status: r <= 5 ? 'ACTIVE RANK' : 'RANKED',
    rankName: rankInfo.rank,
    rankLevel: rankInfo.level,
    rankImage: rankInfo.image,
    rankScale: rankInfo.scale,
    rankX: rankInfo.x,
    rankY: rankInfo.y,
  };
});

export default function HackerLeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    return GENERATED_PLAYERS.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.rankName.toLowerCase().includes(q) ||
        `lvl.${p.rankLevel}`.includes(q)
      );
    });
  }, [searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage) || 1;
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPlayers.slice(start, start + itemsPerPage);
  }, [filteredPlayers, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const top3 = GENERATED_PLAYERS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F9F9F8] dark:bg-black text-[#111111] dark:text-white flex flex-col font-inter transition-colors duration-200">
      {/* Navbar */}
      <PublicNavbar />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-geist font-bold text-[#111111] dark:text-white tracking-tight leading-tight">
              Leaderboard Ranks
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl font-inter leading-relaxed">
              Official personal hacker standings evaluated by code velocity and competition performance.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search player name, handle, rank..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 text-xs text-[#111111] dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#800000] transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Top 3 Podium Cards (Adapts Light & Dark Mode) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-inter">
          {/* Rank 2 */}
          <div className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl space-y-6 flex flex-col justify-between group shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-400 bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-full uppercase">
                Rank #2
              </span>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{top3[1].countryFlag} {top3[1].country}</span>
            </div>

            <div className="space-y-6">
              {/* User Name & Profile Avatar Straight Alignment */}
              <div className="flex items-center gap-3.5">
                <HackerAvatar name={top3[1].name} src={top3[1].avatar} sizeClass="w-14 h-14 text-xl" />
                <div>
                  <h3 className="text-xl font-geist font-bold text-[#111111] dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{top3[1].name}</h3>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{top3[1].handle}</div>
                </div>
              </div>

              {/* Centered Scaled Rank Shield Image & Rank Name */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 py-2">
                <img
                  src={top3[1].rankImage}
                  alt={top3[1].rankName}
                  style={{
                    transform: `scale(${top3[1].rankScale}) translate(${top3[1].rankX}px, ${top3[1].rankY}px)`,
                  }}
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain shrink-0 drop-shadow-lg transition-transform duration-300 mx-auto"
                />
                <div className="font-mono font-bold text-[#111111] dark:text-white">
                  <div className="text-base">{top3[1].rankName}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">- LVL.{top3[1].rankLevel} -</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Score Points</div>
              <div className="text-xl font-geist font-bold text-[#111111] dark:text-white">{top3[1].scorePoints.toLocaleString()} PTS</div>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl space-y-6 flex flex-col justify-between group shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-300 bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-full uppercase">
                Rank #1
              </span>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{top3[0].countryFlag} {top3[0].country}</span>
            </div>

            <div className="space-y-6">
              {/* User Name & Profile Avatar Straight Alignment */}
              <div className="flex items-center gap-3.5">
                <HackerAvatar name={top3[0].name} src={top3[0].avatar} sizeClass="w-16 h-16 text-2xl" />
                <div>
                  <h3 className="text-2xl font-geist font-bold text-[#111111] dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{top3[0].name}</h3>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{top3[0].handle}</div>
                </div>
              </div>

              {/* Centered Scaled Rank Shield Image & Rank Name */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 py-2">
                <img
                  src={top3[0].rankImage}
                  alt={top3[0].rankName}
                  style={{
                    transform: `scale(${top3[0].rankScale}) translate(${top3[0].rankX}px, ${top3[0].rankY}px)`,
                  }}
                  className="w-36 h-36 sm:w-44 sm:h-44 object-contain shrink-0 drop-shadow-xl transition-transform duration-300 mx-auto"
                />
                <div className="font-mono font-bold text-[#111111] dark:text-white">
                  <div className="text-lg">{top3[0].rankName}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">- LVL.{top3[0].rankLevel} -</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Score Points</div>
              <div className="text-2xl font-geist font-bold text-[#111111] dark:text-white">{top3[0].scorePoints.toLocaleString()} PTS</div>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl space-y-6 flex flex-col justify-between group shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-400 bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-full uppercase">
                Rank #3
              </span>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{top3[2].countryFlag} {top3[2].country}</span>
            </div>

            <div className="space-y-6">
              {/* User Name & Profile Avatar Straight Alignment */}
              <div className="flex items-center gap-3.5">
                <HackerAvatar name={top3[2].name} src={top3[2].avatar} sizeClass="w-14 h-14 text-xl" />
                <div>
                  <h3 className="text-xl font-geist font-bold text-[#111111] dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{top3[2].name}</h3>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{top3[2].handle}</div>
                </div>
              </div>

              {/* Centered Scaled Rank Shield Image & Rank Name */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 py-2">
                <img
                  src={top3[2].rankImage}
                  alt={top3[2].rankName}
                  style={{
                    transform: `scale(${top3[2].rankScale}) translate(${top3[2].rankX}px, ${top3[2].rankY}px)`,
                  }}
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain shrink-0 drop-shadow-lg transition-transform duration-300 mx-auto"
                />
                <div className="font-mono font-bold text-[#111111] dark:text-white">
                  <div className="text-base">{top3[2].rankName}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">- LVL.{top3[2].rankLevel} -</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Score Points</div>
              <div className="text-xl font-geist font-bold text-[#111111] dark:text-white">{top3[2].scorePoints.toLocaleString()} PTS</div>
            </div>
          </div>
        </div>

        {/* Main Leaderboard Table Container */}
        <div className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden font-inter shadow-xs">
          
          {/* Table Controls Header */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-geist font-bold text-[#111111] dark:text-white">Player Standings</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Showing {paginatedPlayers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredPlayers.length)} of {filteredPlayers.length} ranked players
              </p>
            </div>

            {/* Pagination Controls Top */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Structure */}
          {paginatedPlayers.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500 dark:text-neutral-400 space-y-3">
              <div>No player profiles match &ldquo;{searchQuery}&rdquo;.</div>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#800000] text-white rounded-full font-bold cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-[#141415] text-[10px] font-mono font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-4 px-6">RANK</th>
                    <th className="py-4 px-6">NAME</th>
                    <th className="py-4 px-6 text-center">RANK ICON</th>
                    <th className="py-4 px-6">RANK NAME</th>
                    <th className="py-4 px-6">SCORE POINTS</th>
                    <th className="py-4 px-6">COUNTRY</th>
                    <th className="py-4 px-6">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {paginatedPlayers.map((player) => (
                    <tr
                      key={player.rank}
                      className="hover:bg-neutral-50 dark:hover:bg-[#141415] transition-colors group cursor-pointer"
                    >
                      {/* Column 1: Rank */}
                      <td className="py-4 px-6 font-mono font-bold text-neutral-700 dark:text-neutral-300">
                        #{player.rank}
                      </td>

                      {/* Column 2: Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <HackerAvatar name={player.name} src={player.avatar} sizeClass="w-9 h-9 text-xs" />
                          <div>
                            <div className="font-bold text-[#111111] dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                              {player.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">{player.handle}</div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Rank Icon */}
                      <td className="py-4 px-6 text-center">
                        <img
                          src={player.rankImage}
                          alt={player.rankName}
                          style={{
                            transform: `scale(${player.rankScale}) translate(${player.rankX}px, ${player.rankY}px)`,
                          }}
                          className="w-28 h-28 sm:w-32 sm:h-32 object-contain inline-block shrink-0 drop-shadow-md transition-transform duration-300"
                        />
                      </td>

                      {/* Column 4: Rank Name */}
                      <td className="py-4 px-6 font-mono">
                        <div className="flex items-center gap-1.5 font-bold text-[#111111] dark:text-white">
                          <span>{player.rankName}</span>
                          <span className="text-[10px] text-neutral-500 font-normal">- LVL.{player.rankLevel} -</span>
                        </div>
                      </td>

                      {/* Column 5: Score Points */}
                      <td className="py-4 px-6 font-mono font-bold text-[#111111] dark:text-white text-sm">
                        {player.scorePoints.toLocaleString()} PTS
                      </td>

                      {/* Column 6: Country */}
                      <td className="py-4 px-6 text-neutral-700 dark:text-neutral-300 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{player.countryFlag}</span>
                          <span>{player.country}</span>
                        </div>
                      </td>

                      {/* Column 7: Status */}
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-neutral-100 dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
                          {player.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer Controls */}
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-inter text-xs">
            <div className="text-neutral-600 dark:text-neutral-400">
              Showing <span className="text-[#111111] dark:text-white font-bold">{paginatedPlayers.length}</span> players per page
            </div>

            {/* Page Buttons Grid (1, 2, 3, 4...) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-800 font-bold"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => handlePageChange(pg)}
                  className={`w-9 h-9 rounded-xl font-bold cursor-pointer transition-all ${
                    currentPage === pg
                      ? 'bg-[#800000] text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-[#141414] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-800 font-bold"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
