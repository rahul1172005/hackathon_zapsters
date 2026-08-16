'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Search, Filter, ExternalLink } from 'lucide-react';

const Github = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface BestProject {
  id: string;
  title: string;
  category: string;
  description: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  hackathonName: string;
  techStack: string[];
  githubUrl: string;
  demoUrl: string;
  starsCount: number;
}

const bestProjectsList: BestProject[] = [
  {
    id: 'proj-1',
    title: 'Aegis Sentinel SLAM',
    category: 'Spatial SLAM & Autonomous Robotics',
    description: 'Real-time 3D LiDAR point-cloud SLAM and ROS2 motion controller built for quadruped robotics in extreme terrain navigation.',
    authorName: 'Rahul Sharma',
    authorHandle: '@rahulsharma_1',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    hackathonName: 'Global Autonomous Systems Summit',
    techStack: ['ROS2', 'C++', 'CUDA', 'Point-Cloud'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.com',
    starsCount: 142,
  },
  {
    id: 'proj-2',
    title: 'Solana Quantum Vault',
    category: 'High-Throughput DeFi Protocol',
    description: 'Post-quantum resilient vault architecture processing 65,000 TPS with automated yield rebalancing and audited smart contracts.',
    authorName: 'Alex Chen',
    authorHandle: '@alexc_ai',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    hackathonName: 'Solana Infrastructure Hackathon',
    techStack: ['Solidity', 'Rust', 'Anchor', 'Web3.js'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.com',
    starsCount: 289,
  },
  {
    id: 'proj-3',
    title: 'Neural Stream Kernel',
    category: 'Edge Neural Runtimes & Machine Learning',
    description: 'Sub-millisecond PyTorch inference runtime optimized for WebAssembly and microcontrollers in low-latency telemetry.',
    authorName: 'Ananya Rao',
    authorHandle: '@ananyarao',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    hackathonName: 'Zapsters AI Systems Summit',
    techStack: ['PyTorch', 'C++', 'Wasm', 'TensorRT'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.com',
    starsCount: 310,
  },
  {
    id: 'proj-4',
    title: 'Zero-Knowledge Proof Telemetry',
    category: 'Privacy & Infrastructure',
    description: 'zk-SNARK telemetry verification suite allowing competition score auditing without revealing underlying code secrets.',
    authorName: 'Elena Rostova',
    authorHandle: '@elena_dev',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    hackathonName: 'Quantum Build 2026',
    techStack: ['Circom', 'Rust', 'Next.js', 'Groth16'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.com',
    starsCount: 198,
  },
  {
    id: 'proj-5',
    title: 'Helios Distributed Cloud',
    category: 'Cloud Infrastructure & Serverless',
    description: 'Serverless event-driven orchestrator distributing compute loads across global edge nodes with automated failover.',
    authorName: 'Marcus Vance',
    authorHandle: '@marcus_v',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    hackathonName: 'Web3 & Decentralized Infra Hackathon',
    techStack: ['Go', 'Docker', 'Kubernetes', 'gRPC'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.com',
    starsCount: 215,
  },
  {
    id: 'proj-6',
    title: 'BioMetric Swarm Telemetry',
    category: 'Biomedical & Hardware IoT',
    description: 'Wearable sensor array processing live biometric data streams using Rust WebSockets and real-time canvas visualization.',
    authorName: 'Priya Patel',
    authorHandle: '@priya_bio',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    hackathonName: 'Zapsters AI Systems Summit',
    techStack: ['Rust', 'TypeScript', 'WebSockets', 'TailwindCSS'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.com',
    starsCount: 176,
  },
];

export default function BestProjectsExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState('ALL');

  const hackathonsFilterOptions = [
    { label: 'All Hackathons', value: 'ALL' },
    { label: 'Zapsters AI Systems Summit', value: 'Zapsters AI Systems Summit' },
    { label: 'Quantum Build 2026', value: 'Quantum Build 2026' },
    { label: 'Global Autonomous Systems Summit', value: 'Global Autonomous Systems Summit' },
    { label: 'Solana Infrastructure Hackathon', value: 'Solana Infrastructure Hackathon' },
    { label: 'Web3 & Decentralized Infra Hackathon', value: 'Web3 & Decentralized Infra Hackathon' },
  ];

  // Filtering Projects based on Search & Hackathon Selection
  const filteredProjects = bestProjectsList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHackathon =
      selectedHackathon === 'ALL' || p.hackathonName === selectedHackathon;

    return matchesSearch && matchesHackathon;
  });

  return (
    <div className="min-h-screen bg-[#F9F9F8] dark:bg-black text-[#111111] dark:text-white flex flex-col font-inter transition-colors duration-200">
      {/* Navbar Header */}
      <PublicNavbar />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 w-full">
        
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-geist font-bold text-[#111111] dark:text-white tracking-tight leading-tight">
              Best Projects Showcase
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl font-inter leading-relaxed">
              Explore top open-source builds and winning solutions created across all hackathons conducted.
            </p>
          </div>

          {/* Filter Controls: Search & Hackathon Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            
            {/* Hackathon Filter Dropdown */}
            <div className="relative w-full sm:w-64">
              <Filter className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedHackathon}
                onChange={(e) => setSelectedHackathon(e.target.value)}
                className="w-full pl-11 pr-8 py-3 rounded-2xl bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#800000] cursor-pointer transition-colors shadow-xs"
              >
                {hackathonsFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0D0D0E] text-[#111111] dark:text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or tech stack..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 text-xs text-[#111111] dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#800000] transition-colors shadow-xs"
              />
            </div>

          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-inter">
          <div className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl space-y-2 shadow-xs">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">FEATURED BUILDS</div>
            <div className="text-3xl sm:text-4xl font-geist font-bold text-[#111111] dark:text-white">{bestProjectsList.length}</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Curated championship projects</div>
          </div>
          <div className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl space-y-2 shadow-xs">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">TOTAL PRIZES WON</div>
            <div className="text-3xl sm:text-4xl font-geist font-bold text-[#800000]">$240,000+</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Disbursed to winning teams</div>
          </div>
          <div className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl space-y-2 shadow-xs">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">REPRESENTATION</div>
            <div className="text-3xl sm:text-4xl font-geist font-bold text-[#111111] dark:text-white">7+</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Participating countries</div>
          </div>
        </div>

        {/* Projects Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 p-12 text-center rounded-3xl space-y-3 shadow-xs">
            <h3 className="text-xl font-geist font-bold text-[#111111] dark:text-white">No Projects Found</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              No projects match the selected hackathon or search query. Try clearing filters.
            </p>
            <button
              onClick={() => {
                setSelectedHackathon('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2 bg-[#800000] text-white text-xs font-bold rounded-full hover:bg-[#660000] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter pt-2">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#0D0D0E] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group shadow-xs"
              >
                <div className="space-y-4">
                  {/* Hackathon Source Badge & GitHub Stars */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono text-red-700 dark:text-red-400 bg-red-50 dark:bg-[#800000]/10 border border-red-200 dark:border-[#800000]/30 px-2.5 py-1 rounded-lg uppercase truncate max-w-[200px]">
                      {proj.hackathonName}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 font-mono shrink-0">
                      <Github className="w-3.5 h-3.5" /> {proj.starsCount} ★
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="space-y-1">
                    <h3 className="text-2xl font-geist font-bold text-[#111111] dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {proj.title}
                    </h3>
                    <div className="text-xs font-mono text-neutral-500 uppercase">{proj.category}</div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>

                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.techStack.map((st) => (
                      <span key={st} className="px-2.5 py-1 bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-700 dark:text-neutral-300 rounded-lg">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Author Profile & Links */}
                <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={proj.authorAvatar}
                      alt={proj.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#111111] dark:text-white leading-tight">{proj.authorName}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">{proj.authorHandle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white border border-neutral-200 dark:border-neutral-800 transition-colors"
                      title="View GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-[#141414] text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white border border-neutral-200 dark:border-neutral-800 transition-colors"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Footer Component */}
      <PublicFooter />
    </div>
  );
}
