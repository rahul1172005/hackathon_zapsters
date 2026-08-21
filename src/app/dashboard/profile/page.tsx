'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import * as api from '@/lib/api';
import { DEFAULT_AVATAR } from '@/lib/auth/roles';
import { GithubIcon } from '@/components/ui/Icons';
import { ExternalLink, Edit3, Check, Camera, X, Upload, AlertCircle, Crop } from 'lucide-react';
import { Participant } from '@/types';
import { ImageCropperModal } from '@/components/modals/ImageCropperModal';

export default function DashboardProfileWorkspacePage() {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let savedAvatar: string | null = null;
      let savedName: string | null = null;
      let savedRole: string | null = null;
      let savedHandle: string | null = null;
      let savedBio: string | null = null;

      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('zapsters_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (typeof parsed.avatar === 'string') {
              if (parsed.avatar.includes('photo-1534528741775-53994a69daeb') || parsed.avatar.includes('unsplash.com/photo-1507003211169') || parsed.avatar.includes('unsplash.com/photo-1494790108377') || parsed.avatar.includes('unsplash.com/photo-1500648767791')) {
                parsed.avatar = '';
                localStorage.setItem('zapsters_user', JSON.stringify(parsed));
                window.dispatchEvent(new Event('storage'));
              }
              savedAvatar = parsed.avatar;
            }
            if (parsed.name) savedName = parsed.name;
            if (parsed.role) savedRole = parsed.role;
            if (parsed.handle) savedHandle = parsed.handle;
            if (parsed.bio) savedBio = parsed.bio;
          } catch {}
        }
      }

      const p = await api.getParticipant();
      if (cancelled || !p) return;
      
      const apiAvatar = (p.avatar && !p.avatar.includes('photo-1534528741775-53994a69daeb')) ? p.avatar : '';
      const effectiveAvatar = savedAvatar !== null ? savedAvatar : apiAvatar;
      const effectiveName = savedName || p.name;
      const effectiveTitle = savedRole || p.title;
      const effectiveHandle = savedHandle || p.githubHandle;
      const effectiveBio = savedBio || p.bio || '';

      setParticipant({
        ...p,
        name: effectiveName,
        title: effectiveTitle,
        githubHandle: effectiveHandle,
        bio: effectiveBio,
        avatar: effectiveAvatar,
      });
      setBio(effectiveBio);
      setPhotoUrl(effectiveAvatar);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!participant) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] text-[#111111] dark:text-white flex flex-col lg:flex-row font-inter">
        <ParticipantSidebar />
        <main className="flex-1 p-12 flex items-center justify-center text-xs font-inter text-[#777777]">
          Loading Profile...
        </main>
      </div>
    );
  }

  const firstLetter = participant.name ? participant.name.trim().charAt(0).toUpperCase() : 'U';

  const handleOpenEditDetails = () => {
    if (!participant) return;
    setEditName(participant.name);
    setEditTitle(participant.title);
    setEditHandle(participant.githubHandle);
    setEditBio(participant.bio);
    setIsEditingDetails(true);
  };

  const handleSaveDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!participant) return;

    const trimmedName = editName.trim() || participant.name;
    const trimmedTitle = editTitle.trim() || participant.title;
    const trimmedHandle = editHandle.trim().replace(/^@/, '') || participant.githubHandle;
    const trimmedBio = editBio.trim() || participant.bio;

    const updated: Participant = {
      ...participant,
      name: trimmedName,
      title: trimmedTitle,
      githubHandle: trimmedHandle,
      bio: trimmedBio,
    };

    setParticipant(updated);
    setBio(trimmedBio);

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('zapsters_user');
      const parsed = storedUser ? JSON.parse(storedUser) : {};
      localStorage.setItem(
        'zapsters_user',
        JSON.stringify({
          ...parsed,
          name: trimmedName,
          role: trimmedTitle,
          handle: trimmedHandle,
          bio: trimmedBio,
        })
      );
      window.dispatchEvent(new Event('storage'));
    }

    setIsEditingDetails(false);
  };

  const handleSaveBio = () => {
    if (!participant) return;
    const updated = { ...participant, bio };
    setParticipant(updated);
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('zapsters_user');
      const parsed = storedUser ? JSON.parse(storedUser) : {};
      localStorage.setItem('zapsters_user', JSON.stringify({ ...parsed, bio }));
      window.dispatchEvent(new Event('storage'));
    }
    setIsEditingBio(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image exceeds 10MB size limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageToCrop(result);
        setIsCropperOpen(true);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file from device.');
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setIsCropperOpen(false);
    handleSavePhoto(croppedDataUrl);
  };

  const handleSavePhoto = (url: string) => {
    const trimmed = (url || '').trim();
    setParticipant({ ...participant, avatar: trimmed });
    setPhotoUrl(trimmed);
    setImageError(false);
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('zapsters_user');
      const parsed = storedUser ? JSON.parse(storedUser) : {};
      localStorage.setItem('zapsters_user', JSON.stringify({ ...parsed, avatar: trimmed }));
      window.dispatchEvent(new Event('storage'));
    }
    setIsEditingPhoto(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] text-[#111111] dark:text-white flex flex-col lg:flex-row font-inter">
      {/* Sidebar stays fixed/anchored on the left */}
      <ParticipantSidebar />

      {/* Main Profile View inside the Workspace */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-28 lg:pb-8 w-full max-w-full min-w-0">

        {/* Header Profile Summary Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-5 sm:p-8 space-y-6 rounded-3xl shadow-xs border border-transparent dark:border-neutral-800">
          <div className="flex flex-col gap-5">
            {!isEditingDetails ? (
              <>
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  {/* Interactive Profile Photo Container with Edit Overlay */}
                  <div className="relative group shrink-0">
                    {participant.avatar && !imageError ? (
                      <img
                        src={participant.avatar}
                        alt={participant.name || 'Profile'}
                        onError={() => setImageError(true)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-sm transition-opacity group-hover:opacity-85"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#800000] text-white font-geist font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-sm select-none shrink-0 transition-opacity group-hover:opacity-85">
                        {firstLetter}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setPhotoUrl(participant.avatar ?? '');
                        setUploadError('');
                        setIsEditingPhoto(true);
                      }}
                      title="Edit Profile Photo"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-[#800000] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#660000] transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-geist font-bold text-[#111111] dark:text-white">{participant.name}</h1>
                      <span className="text-xs font-inter font-bold text-[#800000] dark:text-red-400">
                        @{participant.githubHandle}
                      </span>
                    </div>
                    <p className="font-inter text-sm text-[#777777] dark:text-neutral-400 font-semibold">{participant.title}</p>
                    <p className="text-sm text-[#777777] dark:text-neutral-300 max-w-2xl leading-normal mt-2 font-inter">{participant.bio}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 font-inter text-xs">
                  <button
                    onClick={() => {
                      setPhotoUrl(participant.avatar ?? '');
                      setUploadError('');
                      setIsEditingPhoto(true);
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-[#800000] hover:bg-[#660000] text-white rounded-full font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Change Photo</span>
                  </button>

                  <button
                    onClick={handleOpenEditDetails}
                    className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-[#F7F7F5] dark:bg-[#1F1F1F] hover:bg-[#E5E5E2] dark:hover:bg-[#2B2B2B] text-[#111111] dark:text-white rounded-full font-bold transition-colors cursor-pointer border border-[#E5E5E2] dark:border-neutral-800"
                  >
                    <Edit3 className="w-4 h-4 text-[#800000] dark:text-red-400" />
                    <span>Edit Profile Details</span>
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
              </>
            ) : (
              /* Inline Profile Details Edit Form */
              <form onSubmit={handleSaveDetails} className="space-y-4 font-inter text-xs">
                <div className="flex justify-between items-center pb-1">
                  <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#800000] dark:text-red-400" />
                    Edit Profile Details & Role
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingDetails(false)}
                    className="w-7 h-7 rounded-full bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] hover:text-[#111111] dark:hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 uppercase block">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full p-3.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white rounded-xl outline-none focus:border-[#800000] font-inter text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 uppercase block">
                      GITHUB USERNAME / HANDLE
                    </label>
                    <input
                      type="text"
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      placeholder="e.g. rahul-ai-dev"
                      className="w-full p-3.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white rounded-xl outline-none focus:border-[#800000] font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 uppercase block">
                    ROLE & TECHNICAL SPECIALIZATION (CONTENT / TITLE)
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. AI / ML · Full Stack · Computer Vision"
                    className="w-full p-3.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white rounded-xl outline-none focus:border-[#800000] font-inter text-xs font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] font-bold text-[#777777] dark:text-neutral-400 uppercase block">
                    EXECUTIVE DESCRIPTION & BIO NARRATIVE
                  </label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Describe your engineering focus, hackathon background, and specializations..."
                    className="w-full p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-[#E5E5E2] dark:border-neutral-800 text-[#111111] dark:text-white rounded-2xl outline-none focus:border-[#800000] font-inter text-xs leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingDetails(false)}
                    className="px-5 py-2.5 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#777777] dark:text-neutral-300 rounded-full font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" /> Save Profile Details
                  </button>
                </div>
              </form>
            )}
          </div>

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

        <div className="bg-[#FFFFFF] dark:bg-[#141414] border border-transparent dark:border-neutral-800 p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 rounded-3xl shadow-xs font-inter min-h-[240px] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
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

              <div className="space-y-1">
                <h2 className="text-3xl font-geist font-bold text-[#111111] dark:text-white tracking-tight">
                  Initiator
                </h2>
                <p className="text-xs text-[#777777] dark:text-neutral-400 font-semibold uppercase tracking-wider font-inter">
                  Level 1 • Verified Platform Rank
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#800000] dark:text-red-400 uppercase">
                    88.91th Percentile
                  </span>
                  <span className="text-[11px] font-mono text-[#777777] dark:text-neutral-400">
                    • 2,450 XP Earned
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/rankings"
              className="px-6 py-3 bg-[#111111] dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black font-inter font-bold text-xs rounded-full transition-colors self-start sm:self-center shrink-0 shadow-xs flex items-center gap-2"
            >
              <span>View All 10 Shield Levels</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-inter">
              <span className="text-[#777777] dark:text-neutral-400 uppercase font-mono tracking-wider font-semibold">
                Progress to Level 2 (Oracle)
              </span>
              <span className="text-[#800000] dark:text-red-400 font-bold font-mono text-sm">
                2,450 / 3,000 PTS
              </span>
            </div>
            
            <div className="w-full bg-[#E5E5E2] dark:bg-[#0D0D0D] rounded-full h-3 overflow-hidden p-0.5 border border-[#D5D5D0] dark:border-neutral-800">
              <div
                className="bg-gradient-to-r from-[#800000] via-[#990000] to-[#700000] h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: '81.6%' }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-inter text-[#777777] dark:text-neutral-400">
              <span>Next Reward: <strong className="text-[#111111] dark:text-white font-bold">Oracle Shield Badge</strong></span>
              <span className="font-mono font-semibold text-[#800000] dark:text-red-400">550 PTS Needed</span>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-5 sm:p-8 space-y-4 rounded-3xl shadow-xs border border-transparent dark:border-neutral-800 font-inter">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white">Bio & Engineering Narrative</h2>
            {!isEditingBio ? (
              <button
                onClick={() => setIsEditingBio(true)}
                className="text-xs text-[#800000] dark:text-red-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Bio
              </button>
            ) : (
              <button
                onClick={handleSaveBio}
                className="text-xs text-white bg-[#800000] hover:bg-[#660000] px-3 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" /> Save Bio
              </button>
            )}
          </div>

          {isEditingBio ? (
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 bg-[#F7F7F5] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs rounded-2xl outline-none font-inter text-[#111111] dark:text-white leading-relaxed focus:border-[#800000]"
            />
          ) : (
            <p className="text-xs text-[#777777] dark:text-neutral-300 leading-relaxed">
              {participant.bio}
            </p>
          )}
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-5 sm:p-8 space-y-4 rounded-3xl shadow-xs border border-transparent dark:border-neutral-800 font-inter">
          <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white">Technical Specializations & Stacks</h2>
          <div className="flex flex-wrap gap-2">
            {participant.skills.map((skill) => (
              <span
                key={skill}
                className="px-3.5 py-1.5 bg-[#F7F7F5] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[#111111] dark:text-white text-xs font-mono rounded-xl"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#141414] p-5 sm:p-8 space-y-6 rounded-3xl shadow-xs border border-transparent dark:border-neutral-800 font-inter">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-geist font-bold text-[#111111] dark:text-white">Shipped Projects & Repositories</h2>
            <span className="text-xs text-[#777777] dark:text-neutral-400 font-mono">
              {participant.projects.length} Repos
            </span>
          </div>

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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#141414] max-w-lg w-full p-6 sm:p-8 space-y-6 font-inter shadow-2xl rounded-3xl border border-[#E5E5E2] dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-geist font-bold text-[#111111] dark:text-white flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-[#800000] dark:text-red-400" /> Change Profile Photo
              </h2>
              <button
                onClick={() => setIsEditingPhoto(false)}
                className="w-8 h-8 rounded-full bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Avatar Preview */}
            <div className="p-4 bg-[#F7F7F5] dark:bg-neutral-900/60 rounded-2xl flex items-center gap-4">
              <div className="relative shrink-0">
                {photoUrl.trim() ? (
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#800000]/40 shadow-xs"
                    onError={() => {}}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#800000] text-white font-geist font-bold text-2xl flex items-center justify-center shadow-xs border-2 border-[#800000]/40 select-none">
                    {firstLetter}
                  </div>
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="font-geist font-bold text-sm text-[#111111] dark:text-white truncate">
                  {participant.name}
                </div>
                <p className="text-xs text-[#777777] dark:text-neutral-400 font-inter">
                  {photoUrl.trim() ? 'Custom photo selected' : `Using initial avatar (${firstLetter})`}
                </p>
              </div>
            </div>

            {/* Upload Options */}
            <div className="space-y-4 text-xs font-inter">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Upload from Device Button & Initial Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-[#111111] dark:text-white block">Upload from Device</span>
                    <span className="text-[10px] text-[#777777] dark:text-neutral-400">PNG, JPG, WEBP (Max 5MB)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl('');
                    setUploadError('');
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer group ${
                    !photoUrl.trim()
                      ? 'bg-[#800000]/10 border-[#800000] text-[#800000] dark:text-red-400'
                      : 'bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-[#111111] dark:text-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#800000] text-white flex items-center justify-center font-geist font-bold text-lg group-hover:scale-110 transition-transform">
                    {firstLetter}
                  </div>
                  <div>
                    <span className="font-bold block">Use Name Initial</span>
                    <span className="text-[10px] text-[#777777] dark:text-neutral-400">Display letter &quot;{firstLetter}&quot;</span>
                  </div>
                </button>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Image URL Option */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-[#777777] dark:text-neutral-400 uppercase text-[10px] block">
                    OR PASTE IMAGE URL
                  </label>
                  {photoUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageToCrop(photoUrl.trim());
                        setIsCropperOpen(true);
                      }}
                      className="text-[10px] font-bold text-[#800000] dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Crop className="w-3 h-3" /> Crop & Select Area
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setUploadError('');
                  }}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-3 bg-[#F7F7F5] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-[#111111] dark:text-white rounded-xl outline-none focus:border-[#800000] font-mono"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end gap-3 font-inter text-xs">
              <button
                type="button"
                onClick={() => setIsEditingPhoto(false)}
                className="px-5 py-2.5 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#777777] dark:text-neutral-300 rounded-full font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (photoUrl.trim()) {
                    setImageToCrop(photoUrl.trim());
                    setIsCropperOpen(true);
                  } else {
                    handleSavePhoto('');
                  }
                }}
                className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" /> Save Profile Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Crop & Area Selection Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={imageToCrop}
        userName={participant.name}
        onCropComplete={handleCropComplete}
        onCancel={() => setIsCropperOpen(false)}
      />

    </div>
  );
}
