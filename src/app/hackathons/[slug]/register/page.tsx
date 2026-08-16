'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { getHackathonBySlug } from '@/lib/mockApi';
import { Hackathon } from '@/types';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  User,
  Users,
  Mail,
  Phone,
  Building,
  Globe,
  Code2,
  Tag,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function HackathonRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || 'decentralized-infra-2026';

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State - Team Leader Details
  const [leaderName, setLeaderName] = useState<string>('');
  const [leaderEmail, setLeaderEmail] = useState<string>('');
  const [leaderPhone, setLeaderPhone] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');

  // Form State - Team Setup
  const [teamName, setTeamName] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [teamSize, setTeamSize] = useState<number>(1);

  // Dynamic Team Members State
  const [member2Name, setMember2Name] = useState<string>('');
  const [member2Email, setMember2Email] = useState<string>('');
  const [member3Name, setMember3Name] = useState<string>('');
  const [member3Email, setMember3Email] = useState<string>('');
  const [member4Name, setMember4Name] = useState<string>('');
  const [member4Email, setMember4Email] = useState<string>('');
  const [member5Name, setMember5Name] = useState<string>('');
  const [member5Email, setMember5Email] = useState<string>('');

  // Form State - Project Details
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectSummary, setProjectSummary] = useState<string>('');
  const [techStack, setTechStack] = useState<string>('');

  // Form State - Pricing & Discounts
  const [basePrice, setBasePrice] = useState<number>(49);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountMessage, setDiscountMessage] = useState<string>('');
  const [discountError, setDiscountError] = useState<string>('');

  // Form State - Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'PAYPAL'>('CARD');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');

  // Terms & Submission state
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    getHackathonBySlug(slug).then((res) => {
      if (res) {
        setHackathon(res);
        if (res.tracks && res.tracks.length > 0) {
          setSelectedTrack(res.tracks[0].name);
        }
        if (res.title.toLowerCase().includes('open') || res.prizePool.includes('€') || res.id === 'hack-002') {
          setBasePrice(0);
        } else {
          setBasePrice(49);
        }
      }
      setLoading(false);
    });
  }, [slug]);

  // Discount code handler
  const handleApplyDiscount = () => {
    setDiscountError('');
    setDiscountMessage('');
    const code = discountCode.trim().toUpperCase();

    if (!code) {
      setDiscountError('Please enter a discount code');
      return;
    }

    if (code === 'ZAPSTERS2026' || code === 'STUDENT100' || code === 'FREEPASS') {
      setDiscountApplied(true);
      setDiscountAmount(basePrice);
      setDiscountMessage('Code Applied: 100% OFF - Registration Fee Waived!');
    } else if (code === 'HACKER50' || code === 'HALF50') {
      setDiscountApplied(true);
      setDiscountAmount(Math.round(basePrice * 0.5));
      setDiscountMessage('Code Applied: 50% OFF Discount Applied!');
    } else if (code === 'EARLY20') {
      setDiscountApplied(true);
      setDiscountAmount(20);
      setDiscountMessage('Code Applied: $20 OFF Discount Applied!');
    } else {
      setDiscountError('Invalid discount code. Try "ZAPSTERS2026" or "HACKER50"');
    }
  };

  const finalTotal = Math.max(0, basePrice - discountAmount);

  // Form submission handler
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Please agree to the Code of Conduct and Platform Terms');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  if (loading || !hackathon) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] dark:bg-[#050505] text-[#111111] dark:text-white flex flex-col font-inter transition-colors duration-200">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center p-12 text-sm text-[#777777] dark:text-neutral-400">
          Loading Hackathon Registration...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8] dark:bg-[#050505] text-[#111111] dark:text-white flex flex-col font-inter transition-colors duration-200">
      {/* Public Header Navbar */}
      <PublicNavbar />

      <main className="flex-1 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 w-full">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 font-inter text-xs text-neutral-400">
          <Link href="/hackathons" className="hover:text-white transition-colors">
            Hackathons
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          <Link href={`/hackathons/${hackathon.slug}`} className="hover:text-white transition-colors">
            {hackathon.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-white font-bold">Registration</span>
        </div>

        {/* Success View Screen */}
        {isSuccess ? (
          <div className="bg-[#0D0D0E] border border-neutral-800/80 p-8 sm:p-12 rounded-3xl space-y-8 text-center max-w-2xl mx-auto shadow-xl animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-geist font-bold text-white">
                Registration Successful!
              </h1>
              <p className="text-sm text-neutral-400 font-inter leading-relaxed max-w-lg mx-auto">
                Team <span className="font-bold text-white">{teamName || 'Hackers'}</span> is officially registered for <span className="font-bold text-red-400">{hackathon.title}</span>. Your team workspace is ready.
              </p>
            </div>

            {/* Registration Receipt Specs */}
            <div className="bg-[#131315] border border-neutral-800 p-6 rounded-2xl text-left space-y-3 text-xs font-inter">
              <div className="flex justify-between items-center pb-2">
                <span className="text-neutral-400">Team Leader</span>
                <span className="font-bold text-white">{leaderName} ({leaderEmail})</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-neutral-400">Selected Track</span>
                <span className="font-bold text-red-400">{selectedTrack || 'General Track'}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-neutral-400">Team Roster</span>
                <span className="font-bold text-white">{teamSize} Members Registered</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Fee Status</span>
                <span className="font-bold text-emerald-400 uppercase">
                  {finalTotal === 0 ? 'FREE / WAIVED' : `$${finalTotal}.00 PAID`}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/my-teams/team-001/overview"
                className="flex-1 py-4 bg-[#800000] hover:bg-[#660000] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2"
              >
                Go to Team Workspace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/hackathons"
                className="py-4 px-8 bg-[#131315] border border-neutral-800 text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider rounded-full transition-colors"
              >
                Back to Hackathons
              </Link>
            </div>
          </div>
        ) : (
          /* Main Form View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Sections */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Header Title */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-geist font-bold text-white tracking-tight">
                  Hackathon Registration
                </h1>
                <p className="text-sm sm:text-base text-neutral-400 font-inter">
                  Complete team details, project proposal, and member roster to confirm entry.
                </p>
              </div>

              <form onSubmit={handleSubmitRegistration} className="space-y-8">
                
                {/* ================= SECTION 1: TEAM LEADER DETAILS ================= */}
                <div className="bg-[#0D0D0E] border border-neutral-800/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
                  <div className="flex items-center gap-3 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#800000]/20 text-red-400 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-geist font-bold text-white">
                        1. Team Leader / Primary Registrant
                      </h2>
                      <p className="text-xs text-neutral-400">
                        Main point of contact for updates and team management.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-inter">
                    <div className="space-y-2">
                      <label className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-red-400" /> Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-white flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-red-400" /> Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-white flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-red-400" /> Contact Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={leaderPhone}
                        onChange={(e) => setLeaderPhone(e.target.value)}
                        placeholder="Enter contact phone number"
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-white flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-neutral-400" /> College / Organization *
                      </label>
                      <input
                        type="text"
                        required
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="College or University name"
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="font-bold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-neutral-400" /> GitHub / Portfolio URL
                      </label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://github.com/your-handle"
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>
                  </div>
                </div>

                {/* ================= SECTION 2: TEAM SETUP & TRACK ================= */}
                <div className="bg-[#0D0D0E] border border-neutral-800/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
                  <div className="flex items-center gap-3 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#800000]/20 text-red-400 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-geist font-bold text-white">
                        2. Team Configuration & Track Selection
                      </h2>
                      <p className="text-xs text-neutral-400">
                        Define your team identity and competitive focus track.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-inter">
                    <div className="space-y-2">
                      <label className="font-bold text-white">Team Name *</label>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter team name"
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-white">Selected Track *</label>
                      <select
                        value={selectedTrack}
                        onChange={(e) => setSelectedTrack(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white focus:outline-none focus:border-[#800000]"
                      >
                        {hackathon.tracks.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name} ({t.prize})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="font-bold text-white">Total Team Size *</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setTeamSize(size)}
                            className={`py-3 rounded-2xl font-bold transition-all text-xs cursor-pointer ${
                              teamSize === size
                                ? 'bg-[#800000] text-white shadow-xs'
                                : 'bg-[#131315] text-neutral-400 border border-neutral-800 hover:text-white'
                            }`}
                          >
                            {size === 1 ? 'Solo (1)' : `${size} Members`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= SECTION 3: DYNAMIC TEAM MEMBERS ROSTER ================= */}
                {teamSize > 1 && (
                  <div className="bg-[#0D0D0E] border border-neutral-800/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-4">
                      <div>
                        <h2 className="text-xl font-geist font-bold text-white">
                          3. Team Members Roster ({teamSize - 1} Additional Members)
                        </h2>
                        <p className="text-xs text-neutral-400">
                          Provide names and emails for additional team teammates.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-red-400 bg-[#800000]/20 px-3 py-1 rounded-full">
                        {teamSize - 1} Invites Active
                      </span>
                    </div>

                    <div className="space-y-4 text-xs font-inter">
                      {/* Member 2 */}
                      {teamSize >= 2 && (
                        <div className="p-4 bg-[#131315] border border-neutral-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Member 2 Name *</label>
                            <input
                              type="text"
                              required
                              value={member2Name}
                              onChange={(e) => setMember2Name(e.target.value)}
                              placeholder="Teammate 2 Name"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white placeholder-neutral-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Member 2 Email *</label>
                            <input
                              type="email"
                              required
                              value={member2Email}
                              onChange={(e) => setMember2Email(e.target.value)}
                              placeholder="teammate2@example.com"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white placeholder-neutral-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Member 3 */}
                      {teamSize >= 3 && (
                        <div className="p-4 bg-[#131315] border border-neutral-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Member 3 Name *</label>
                            <input
                              type="text"
                              required
                              value={member3Name}
                              onChange={(e) => setMember3Name(e.target.value)}
                              placeholder="Teammate 3 Name"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white placeholder-neutral-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Member 3 Email *</label>
                            <input
                              type="email"
                              required
                              value={member3Email}
                              onChange={(e) => setMember3Email(e.target.value)}
                              placeholder="teammate3@example.com"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white placeholder-neutral-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Member 4 */}
                      {teamSize >= 4 && (
                        <div className="p-4 bg-[#131315] border border-neutral-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Member 4 Name *</label>
                            <input
                              type="text"
                              required
                              value={member4Name}
                              onChange={(e) => setMember4Name(e.target.value)}
                              placeholder="Teammate 4 Name"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white placeholder-neutral-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Member 4 Email *</label>
                            <input
                              type="email"
                              required
                              value={member4Email}
                              onChange={(e) => setMember4Email(e.target.value)}
                              placeholder="teammate4@example.com"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white placeholder-neutral-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Member 5 */}
                      {teamSize >= 5 && (
                        <div className="p-4 bg-[#131315] border border-neutral-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Member 5 Name *</label>
                            <input
                              type="text"
                              required
                              value={member5Name}
                              onChange={(e) => setMember5Name(e.target.value)}
                              placeholder="Teammate 5 Name"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white placeholder-neutral-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Member 5 Email *</label>
                            <input
                              type="email"
                              required
                              value={member5Email}
                              onChange={(e) => setMember5Email(e.target.value)}
                              placeholder="teammate5@example.com"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white placeholder-neutral-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= SECTION 4: PROJECT IDEA & PROPOSAL ================= */}
                <div className="bg-[#0D0D0E] border border-neutral-800/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
                  <div className="flex items-center gap-3 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#800000]/20 text-red-400 flex items-center justify-center font-bold">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-geist font-bold text-white">
                        4. Project Concept & Technical Stack
                      </h2>
                      <p className="text-xs text-neutral-400">
                        Outline your hackathon submission vision and target architecture.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 text-xs font-inter">
                    <div className="space-y-2">
                      <label className="font-bold text-white">Project Title *</label>
                      <input
                        type="text"
                        required
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="Enter project title"
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-white">Problem Statement & Solution Brief *</label>
                      <textarea
                        rows={4}
                        required
                        value={projectSummary}
                        onChange={(e) => setProjectSummary(e.target.value)}
                        placeholder="Describe the problem, your solution approach, and anticipated impact..."
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-white">Target Tech Stack & Frameworks *</label>
                      <input
                        type="text"
                        required
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        placeholder="e.g. Next.js, PyTorch, Rust, ROS2, Tailwind"
                        className="w-full px-4 py-3 rounded-2xl bg-[#131315] border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-[#800000]"
                      />
                    </div>
                  </div>
                </div>

                {/* ================= SECTION 5: FEE, DISCOUNT & PAYMENT ================= */}
                <div className="bg-[#0D0D0E] border border-neutral-800/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
                  <div className="flex items-center gap-3 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#800000]/20 text-red-400 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-geist font-bold text-white">
                        5. Fee & Payment Portal
                      </h2>
                      <p className="text-xs text-neutral-400">
                        Apply discount codes or complete entry fee checkout.
                      </p>
                    </div>
                  </div>

                  {/* Pricing Breakdown & Discount Code input */}
                  <div className="bg-[#131315] border border-neutral-800 p-6 rounded-2xl space-y-4 font-inter">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 font-bold uppercase">Standard Entry Fee</span>
                      <span className="font-bold text-white text-sm">
                        {basePrice === 0 ? 'FREE ($0.00)' : `$${basePrice}.00 USD`}
                      </span>
                    </div>

                    {/* Discount Code Input */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-white mb-2">
                        Discount Code (Optional)
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder="Enter code: ZAPSTERS2026 or HACKER50"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-[#800000]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyDiscount}
                          className="px-5 py-2.5 bg-[#800000] text-white font-bold text-xs rounded-xl hover:bg-[#660000] transition-colors cursor-pointer"
                        >
                          Apply Code
                        </button>
                      </div>

                      {/* Discount feedback messages */}
                      {discountMessage && (
                        <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> {discountMessage}
                        </div>
                      )}
                      {discountError && (
                        <div className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> {discountError}
                        </div>
                      )}
                    </div>

                    {/* Final Calculations */}
                    <div className="pt-3 space-y-2 text-xs font-inter">
                      {discountApplied && (
                        <div className="flex justify-between items-center text-emerald-400 font-bold">
                          <span>Discount Applied</span>
                          <span>-${discountAmount}.00 USD</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm font-bold text-white pt-1">
                        <span>Total Due Today</span>
                        <span className="text-xl font-geist text-red-400">
                          {finalTotal === 0 ? 'FREE ($0.00)' : `$${finalTotal}.00 USD`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector & Inputs (Hidden if Total is FREE) */}
                  {finalTotal === 0 ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Registration is 100% Free - No payment or credit card required.</span>
                    </div>
                  ) : (
                    <div className="space-y-5 text-xs font-inter pt-2 animate-in fade-in duration-200">
                      <div className="space-y-2">
                        <label className="font-bold text-white">Payment Method *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: 'CARD', label: 'Credit / Debit Card' },
                              { id: 'UPI', label: 'UPI / NetBanking' },
                              { id: 'PAYPAL', label: 'Stripe / PayPal' },
                            ].map((pm) => (
                              <button
                                key={pm.id}
                                type="button"
                                onClick={() => setPaymentMethod(pm.id as 'CARD' | 'UPI' | 'PAYPAL')}
                              className={`py-3 px-3 rounded-2xl font-bold transition-all text-xs cursor-pointer border ${
                                paymentMethod === pm.id
                                  ? 'bg-[#800000] text-white border-[#800000]'
                                  : 'bg-[#131315] text-neutral-400 border-neutral-800'
                              }`}
                            >
                              {pm.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Input fields */}
                      {paymentMethod === 'CARD' && (
                        <div className="p-5 bg-[#131315] border border-neutral-800 rounded-2xl space-y-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-white">Card Number *</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4242 •••• •••• 4242"
                              className="w-full px-4 py-3 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white font-mono text-xs placeholder-neutral-600"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="font-bold text-white">Expiry (MM/YY) *</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="12/28"
                                className="w-full px-4 py-3 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white font-mono text-xs placeholder-neutral-600"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-white">CVC Code *</label>
                              <input
                                type="text"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                placeholder="888"
                                className="w-full px-4 py-3 rounded-xl bg-[#0D0D0E] border border-neutral-800 text-white font-mono text-xs placeholder-neutral-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms Consent & Final Submission CTA */}
                <div className="space-y-4 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs font-inter text-neutral-400">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#800000] focus:ring-[#800000]"
                    />
                    <span>
                      I agree to the <span className="font-bold text-white">Platform Code of Conduct</span> and team registration policies.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 bg-[#800000] hover:bg-[#660000] text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>Processing Registration...</>
                    ) : (
                      <>
                        COMPLETE HACKATHON REGISTRATION <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Hackathon Summary Card */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="bg-[#0D0D0E] border border-neutral-800/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
                
                <div className="space-y-3 pb-2">


                  <h3 className="text-2xl font-geist font-bold text-white leading-snug">
                    {hackathon.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-inter">
                    {hackathon.tagline}
                  </p>
                </div>

                {/* Event Summary Grid */}
                <div className="space-y-3 text-xs font-inter">
                  <div className="flex items-center gap-3 text-neutral-400">
                    <Trophy className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold uppercase text-neutral-500">PRIZE POOL</div>
                      <div className="font-bold text-red-400">{hackathon.prizePool}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-400">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold uppercase text-neutral-500">DATES</div>
                      <div className="font-bold text-white">{hackathon.startDate} - {hackathon.endDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-400">
                    <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold uppercase text-neutral-500">DURATION</div>
                      <div className="font-bold text-white">{hackathon.durationHours} Hours</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-400">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold uppercase text-neutral-500">LOCATION</div>
                      <div className="font-bold text-white">{hackathon.location}</div>
                    </div>
                  </div>
                </div>

                {/* Tracks list */}
                <div className="pt-2 space-y-2 text-xs font-inter">
                  <div className="font-bold text-white uppercase text-[10px]">AVAILABLE TRACKS</div>
                  <div className="space-y-2">
                    {hackathon.tracks.map((t) => (
                      <div key={t.id} className="p-3 bg-[#131315] rounded-xl border border-neutral-800">
                        <div className="font-bold text-white">{t.name}</div>
                        <div className="text-[10px] text-red-400 font-bold">{t.prize}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
