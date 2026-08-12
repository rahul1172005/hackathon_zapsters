'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { MOCK_PARTICIPANT } from '@/lib/mockData';
import { GithubIcon } from '@/components/ui/Icons';
import { ExternalLink, Edit3, Check, Camera, X } from 'lucide-react';

export default function DashboardProfileWorkspacePage() {
  const [participant, setParticipant] = useState(MOCK_PARTICIPANT);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [bio, setBio] = useState(participant.bio);
  const [photoUrl, setPhotoUrl] = useState(participant.avatar);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  ];

  const handleSaveBio = () => {
    setParticipant({ ...participant, bio });
    setIsEditingBio(false);
  };

  const handleSavePhoto = (url: string) => {
    setParticipant({ ...participant, avatar: url });
    setPhotoUrl(url);
    setIsEditingPhoto(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] text-[#111111] dark:text-white flex font-inter">
      {/* Sidebar stays fixed/anchored on the left */}
      <ParticipantSidebar />

      {/* Main Profile View inside the Workspace */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">

        {/* Header Profile Summary Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-5 sm:p-8 space-y-6 rounded-3xl shadow-xs">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">

              {/* Interactive Profile Photo Container with Edit Overlay */}
              <div className="relative group shrink-0">
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-sm transition-opacity group-hover:opacity-85"
                />
                <button
                  onClick={() => setIsEditingPhoto(true)}
                  title="Edit Profile Photo"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#800000] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#660000] transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">{participant.name}</h1>
                  <span className="text-xs font-inter font-bold text-[#800000] dark:text-red-400 bg-[#800000]/10 px-3 py-1 rounded-full">
                    @{participant.githubHandle}
                  </span>
                </div>
                <p className="font-inter text-sm text-[#777777] dark:text-neutral-400 font-semibold">{participant.title}</p>
                <p className="text-sm text-[#777777] dark:text-neutral-300 max-w-2xl leading-normal mt-2 font-inter">{participant.bio}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 font-inter text-xs">
              <button
                onClick={() => setIsEditingPhoto(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-[#800000] hover:bg-[#660000] text-white rounded-full font-bold transition-colors shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
              </button>

              <a
                href={`https://github.com/${participant.githubHandle}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-[#F7F7F5] dark:bg-[#1F1F1F] hover:bg-[#E5E5E2] dark:hover:bg-[#2B2B2B] text-[#111111] dark:text-white rounded-full font-bold transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span>@{participant.githubHandle}</span>
              </a>
            </div>
          </div>

          {/* Key Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-inter pt-2">
            <div className="p-5 bg-[#F7F7F5] dark:bg-[#1A1A1A] rounded-2xl">
              <div className="text-xs text-[#777777] dark:text-neutral-400 uppercase font-bold">HACKATHONS</div>
              <div className="text-3xl font-bold font-geist text-[#111111] dark:text-white mt-1">{participant.stats.hackathonsCount}</div>
            </div>
            <div className="p-5 bg-[#F7F7F5] dark:bg-[#1A1A1A] rounded-2xl">
              <div className="text-xs text-[#777777] dark:text-neutral-400 uppercase font-bold">GRAND WINS</div>
              <div className="text-3xl font-bold font-geist text-[#800000] dark:text-red-400 mt-1">{participant.stats.wins}</div>
            </div>
            <div className="p-5 bg-[#F7F7F5] dark:bg-[#1A1A1A] rounded-2xl">
              <div className="text-xs text-[#777777] dark:text-neutral-400 uppercase font-bold">FINALS</div>
              <div className="text-3xl font-bold font-geist text-[#111111] dark:text-white mt-1">{participant.stats.finals}</div>
            </div>
            <div className="p-5 bg-[#F7F7F5] dark:bg-[#1A1A1A] rounded-2xl">
              <div className="text-xs text-[#777777] dark:text-neutral-400 uppercase font-bold">PROJECTS</div>
              <div className="text-3xl font-bold font-geist text-[#111111] dark:text-white mt-1">{participant.stats.projectsCount}</div>
            </div>
          </div>
        </div>

        {/* Personal Rank & Level Progress Card (Border-free) */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-10 md:p-12 space-y-8 rounded-3xl shadow-xs font-inter min-h-[270px] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Direct Rank Image */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <img
                  src="/images (4)/16.png"
                  alt="Initiator Rank"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
                  style={{ transform: 'scale(1.51) translate(0px, 0px)' }}
                />
              </div>

              {/* Rank Name & Role Info */}
              <div className="space-y-1">
                <h2 className="text-3xl font-geist font-bold text-[#111111] dark:text-white tracking-tight">
                  Initiator
                </h2>
                <p className="text-xs text-[#777777] dark:text-neutral-400 font-semibold uppercase tracking-wider font-inter">
                  Developer
                </p>
              </div>
            </div>

            {/* View Ranking Button */}
            <Link
              href="/dashboard/rankings"
              className="px-5 py-2.5 bg-[#F7F7F5] dark:bg-[#1F1F1F] hover:bg-[#E5E5E2] dark:hover:bg-[#2B2B2B] text-[#800000] dark:text-red-400 border border-[#800000]/20 text-xs font-inter font-bold rounded-full transition-colors flex items-center gap-1.5 self-start sm:self-center shadow-xs"
            >
              <span>View Ranking</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Points Progress Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-inter">
              <span className="text-[#777777] dark:text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                PROGRESS TO NEXT RANK (LEADER)
              </span>
              <span className="font-mono font-bold text-[#111111] dark:text-white text-xs">
                <span className="text-[#800000] dark:text-red-400">2,450</span> / 3,000 PTS
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#F7F7F5] dark:bg-[#0D0D0D] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#E5E5E2] dark:border-neutral-800 shadow-inner">
              <div
                className="bg-gradient-to-r from-[#800000] via-[#990000] to-[#700000] h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: '81.6%' }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#777777] dark:text-neutral-400 pt-0.5">
              <span>81.6% Completed</span>
              <span>550 PTS Remaining</span>
            </div>
          </div>
        </div>

        {/* Bio Edit & Skills Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-8 space-y-6 rounded-3xl shadow-xs">
          <div className="flex justify-between items-center pb-1">
            <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">Hacker Bio & Skills</h2>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="px-4 py-2 bg-[#F7F7F5] dark:bg-[#1F1F1F] hover:bg-[#E5E5E2] dark:hover:bg-[#2B2B2B] text-[#111111] dark:text-white text-xs font-inter font-bold rounded-full transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#800000] dark:text-red-400" /> {isEditingBio ? 'Cancel Edit' : 'Edit Bio'}
            </button>
          </div>

          {isEditingBio ? (
            <div className="space-y-4 font-inter text-xs">
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-4 bg-[#F7F7F5] dark:bg-[#1A1A1A] text-[#111111] dark:text-white border-none text-xs rounded-2xl outline-none font-inter"
              />
              <button
                onClick={handleSaveBio}
                className="px-5 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Bio
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#111111] dark:text-neutral-300 leading-relaxed font-inter">{participant.bio}</p>
          )}

          <div className="space-y-2 pt-2">
            <div className="text-xs font-inter font-bold text-[#777777] dark:text-neutral-400 uppercase">VERIFIED TECH STACK</div>
            <div className="flex flex-wrap gap-2 text-xs font-inter">
              {['Python', 'PyTorch', 'TensorRT', 'TypeScript', 'Next.js', 'FastAPI', 'YOLOv9', 'CUDA'].map((sk) => (
                <span key={sk} className="px-3.5 py-1.5 bg-[#F7F7F5] dark:bg-[#1A1A1A] text-[#111111] dark:text-white rounded-full font-semibold">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Shipped Projects List */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-8 space-y-6 rounded-3xl shadow-xs">
          <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">Shipped Hackathon Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {participant.projects.map((proj, idx) => (
              <div key={idx} className="p-6 bg-[#F7F7F5] dark:bg-[#1A1A1A] space-y-3 rounded-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-geist font-bold text-[#111111] dark:text-white">{proj.name}</h3>
                    <div className="text-xs font-inter text-[#777777] dark:text-neutral-400 mt-0.5">{proj.hackathonName} • {proj.year}</div>
                  </div>
                  <Link href="/teams/cyberforge" className="text-xs font-inter text-[#800000] dark:text-red-400 font-bold hover:underline flex items-center gap-1">
                    Repo Specs <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-[#777777] dark:text-neutral-300 leading-relaxed font-inter">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Edit Profile Image Modal */}
      {isEditingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#141414] max-w-md w-full p-8 space-y-6 font-inter shadow-2xl rounded-3xl border border-transparent dark:border-neutral-800">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#800000] dark:text-red-400" /> Edit Profile Photo
              </h2>
              <button
                onClick={() => setIsEditingPhoto(false)}
                className="w-8 h-8 rounded-full bg-[#F7F7F5] dark:bg-[#222222] text-[#777777] dark:text-neutral-300 hover:text-[#111111] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-inter">
              <div className="space-y-2">
                <label className="font-bold text-[#777777] uppercase text-[11px] block">IMAGE URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 bg-[#F7F7F5] border-none text-xs rounded-2xl outline-none font-inter"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="font-bold text-[#777777] uppercase text-[11px] block">OR CHOOSE SAMPLE AVATAR</label>
                <div className="grid grid-cols-4 gap-3">
                  {sampleAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSavePhoto(url)}
                      className={`relative rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${photoUrl === url ? 'border-[#800000]' : 'border-transparent'
                        }`}
                    >
                      <img src={url} alt={`Avatar ${idx + 1}`} loading="lazy" decoding="async" className="w-16 h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 font-inter text-xs">
              <button
                onClick={() => setIsEditingPhoto(false)}
                className="px-5 py-2.5 bg-[#F7F7F5] text-[#777777] rounded-full font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSavePhoto(photoUrl)}
                className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-full shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Apply Photo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
