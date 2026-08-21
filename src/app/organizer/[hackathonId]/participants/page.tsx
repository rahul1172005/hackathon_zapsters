'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { OrganizerSidebar } from '@/components/navigation/OrganizerSidebar';
import { Search, Download, Mail, UserCheck } from 'lucide-react';

interface ParticipantRow {
  id: string;
  name: string;
  username: string;
  email: string;
  team: string;
  track: string;
  status: 'Active' | 'Registered' | 'Submitted' | 'Disqualified';
  registrationDate: string;
}

const MOCK_PARTICIPANT_ROWS: ParticipantRow[] = [
  { id: 'p1', name: 'Rahul Sharma', username: 'rahul_dev', email: 'rahul@example.com', team: 'CyberForge', track: '02 Computer Vision', status: 'Active', registrationDate: '10 Aug 2026' },
  { id: 'p2', name: 'Arun Kumar', username: 'arunk', email: 'arun@example.com', team: 'CyberForge', track: '02 Computer Vision', status: 'Active', registrationDate: '10 Aug 2026' },
  { id: 'p3', name: 'Sarah Chen', username: 'sarah_c', email: 'sarah@example.com', team: 'Neural Forge', track: '01 AI Infrastructure', status: 'Submitted', registrationDate: '08 Aug 2026' },
  { id: 'p4', name: 'Marcus Vance', username: 'mvance', email: 'marcus@example.com', team: 'Neural Forge', track: '01 AI Infrastructure', status: 'Submitted', registrationDate: '08 Aug 2026' },
  { id: 'p5', name: 'Priya Sharma', username: 'psharma', email: 'priya@example.com', team: 'CodeX', track: '01 AI Infrastructure', status: 'Active', registrationDate: '09 Aug 2026' },
  { id: 'p6', name: 'Rohan Gupta', username: 'rohang', email: 'rohan@example.com', team: 'ByteBuilders', track: '03 Robotics & Civil Tech', status: 'Registered', registrationDate: '11 Aug 2026' },
];

export default function ParticipantsManagementPage() {
  const params = useParams();
  const hackathonId = (params?.hackathonId as string) || 'quantum-build-2026';

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = MOCK_PARTICIPANT_ROWS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex flex-col lg:flex-row font-inter">
      <OrganizerSidebar hackathonId={hackathonId} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">
        
        {/* Header — NO divided lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 font-inter">
          <div>
            <div className="text-xs font-mono text-[#800000] font-bold uppercase tracking-widest">
              PEOPLE MANAGEMENT
            </div>
            <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white mt-0.5">
              Participants Directory
            </h1>
          </div>

          <div className="font-mono text-xs text-[#800000] bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 px-4 py-2 rounded-full font-bold shadow-2xs self-start sm:self-auto">
            TOTAL: 842 REGISTERED HACKERS
          </div>
        </div>

        {/* Search & Bulk Action Bar — Curved Corners rounded-3xl, NO divided lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-5 rounded-3xl shadow-xs space-y-3 font-inter">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="text"
                  placeholder="Search by name, team, or track..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 focus:border-[#800000] pl-10 pr-4 py-2.5 text-xs rounded-full outline-none text-[#111111] dark:text-white font-medium"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-xs py-2.5 px-4 rounded-full outline-none text-[#111111] dark:text-white font-medium cursor-pointer"
              >
                <option value="ALL">Status: All</option>
                <option value="ACTIVE">Active</option>
                <option value="REGISTERED">Registered</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="DISQUALIFIED">Disqualified</option>
              </select>
            </div>

            {/* Bulk Action Buttons */}
            <div className="flex items-center gap-2 text-xs font-inter">
              <button
                disabled={selectedIds.length === 0}
                className="px-4 py-2 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 disabled:opacity-50 text-[#111111] dark:text-white rounded-full transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#800000]" /> Message ({selectedIds.length})
              </button>
              <button
                disabled={selectedIds.length === 0}
                className="px-4 py-2 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 disabled:opacity-50 text-[#111111] dark:text-white rounded-full transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#800000]" /> Change Status
              </button>
              <button className="px-4 py-2 bg-[#800000] text-white hover:bg-[#660000] font-bold rounded-full transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Participants Table — Curved Corners rounded-3xl, NO Divided Lines */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-xs">
              <thead>
                <tr className="bg-[#F7F7F5] dark:bg-neutral-900 font-mono text-[10px] uppercase text-[#777777] dark:text-neutral-400">
                  <th className="py-3 px-5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-[#800000]"
                    />
                  </th>
                  <th className="py-3 px-5">PARTICIPANT NAME</th>
                  <th className="py-3 px-5">TEAM</th>
                  <th className="py-3 px-5">TRACK</th>
                  <th className="py-3 px-5">REGISTRATION DATE</th>
                  <th className="py-3 px-5 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F7F5] dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="accent-[#800000]"
                      />
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[#111111] dark:text-white">
                      <div>{p.name}</div>
                      <div className="text-[10px] font-mono text-[#777777] dark:text-neutral-400">@{p.username}</div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#111111] dark:text-neutral-200">{p.team}</td>
                    <td className="py-3.5 px-5 font-mono text-[#777777] dark:text-neutral-400">{p.track}</td>
                    <td className="py-3.5 px-5 font-mono text-[#777777] dark:text-neutral-400">{p.registrationDate}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#800000]/10 text-[#800000] border border-[#800000]/20">
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
