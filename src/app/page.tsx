import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { HowItWorksCards } from '@/components/landing/HowItWorksCards';
import { InfrastructureCards } from '@/components/landing/InfrastructureCards';
import { OrganizationCards } from '@/components/landing/OrganizationCards';
import { HeroImage } from '@/components/landing/HeroImage';
import { MOCK_HACKATHONS } from '@/lib/mockData';
import {
  Search,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  const featuredHackathons = MOCK_HACKATHONS;

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-inter">
      <PublicNavbar />

      {/* 1. Hero Section */}
      <section className="w-full py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Main Copy */}
            <div className="lg:col-span-7 space-y-8">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-geist font-light text-[#111111] tracking-tight leading-[1.02]">
                The Operating System<br />
                For Hackathons
              </h1>

              <p className="text-lg sm:text-xl text-[#777777] max-w-2xl leading-relaxed">
                Run competitions, build team identity, track progress, judge with rubric precision, and broadcast live competition intelligence.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#800000] hover:bg-[#660000] text-white text-sm font-geist font-light uppercase tracking-wider rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  <Search className="w-4 h-4" />
                  Explore Hackathons
                </Link>
                <Link
                  href="/organizer/quantum-build-2026/overview"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#F7F7F5] hover:bg-[#E5E5E2] text-[#111111] text-sm font-geist font-light uppercase tracking-wider rounded-full transition-all"
                >
                  <Cpu className="w-4 h-4 text-[#800000]" />
                  Host a Hackathon
                </Link>
              </div>
            </div>

            {/* Hero Image Section */}
            <div className="lg:col-span-5">
              <HeroImage />
            </div>

          </div>
        </div>
      </section>

      {/* 2. How Zapsters Works Section */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <h2 className="text-4xl sm:text-5xl font-geist font-bold text-[#111111]">How Zapsters Works</h2>
          <p className="text-base text-[#777777] mt-2 font-inter">A connected flow from discovery to final broadcast standings.</p>
        </div>

        <HowItWorksCards />
      </section>

      {/* 3. Featured Hackathons Section */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl sm:text-5xl font-geist font-bold text-[#111111]">Featured Competitions</h2>
              <p className="text-base text-[#777777] mt-2 font-inter">High-stakes hackathons active on the platform right now.</p>
            </div>
            <Link href="/explore" className="text-sm font-inter font-bold text-[#800000] hover:underline">
              View All Hackathons →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredHackathons.map((h) => (
              <div key={h.id} className="bg-[#FFFFFF] border border-[#E5E5E2] p-8 space-y-6 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#777777] uppercase tracking-wider font-inter">{h.organization}</div>
                  <h3 className="text-2xl font-geist font-bold text-[#111111]">{h.title}</h3>
                  <p className="text-sm text-[#777777] font-inter leading-relaxed">{h.tagline}</p>
                </div>
                <div className="pt-4 flex justify-between items-center text-sm font-inter">
                  <span className="font-bold text-base text-[#800000]">{h.prizePool}</span>
                  <Link href={`/hackathons/${h.slug}`} className="px-5 py-2.5 bg-[#800000] text-white rounded-full font-bold text-xs hover:bg-[#660000] transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Enterprise Infrastructure & OS Capabilities */}
      <section className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-geist font-bold text-[#111111]">
              Built for Enterprise Hackathon Scale
            </h2>
            <p className="text-base text-[#777777] mt-2 font-inter max-w-2xl">
              Zapsters provides complete competition infrastructure for organizers, engineering teams, and judges.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#111111] hover:bg-[#222222] text-white text-xs font-inter font-bold uppercase rounded-full inline-flex items-center gap-2 transition-colors shadow-xs"
          >
            Launch Participant OS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <InfrastructureCards />
      </section>

      {/* 5. Powering World-Class Organizations (Final Section, Thin Geist font, Company Name & Website Link ONLY) */}
      <section className="py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-geist font-light text-[#111111] tracking-tight">
              Powering World-Class Organizations
            </h2>
          </div>

          <OrganizationCards />
        </div>
      </section>

      {/* Modern Aesthetic Public Footer */}
      <PublicFooter />
    </div>
  );
}
