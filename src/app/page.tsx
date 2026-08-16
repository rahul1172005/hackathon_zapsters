import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { HowItWorksCards } from '@/components/landing/HowItWorksCards';
import { InfrastructureCards } from '@/components/landing/InfrastructureCards';
import { OrganizationCards } from '@/components/landing/OrganizationCards';
import { HeroImage } from '@/components/landing/HeroImage';
import { MOCK_HACKATHONS } from '@/lib/mockData';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './seo';
import { Search, Cpu, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'ZAPSTERS — The Operating System For Hackathons',
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'ZAPSTERS — The Operating System For Hackathons',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZAPSTERS — The Operating System For Hackathons',
    description: SITE_DESCRIPTION,
  },
};

export default function LandingPage() {
  const featuredHackathons = MOCK_HACKATHONS;

  return (
    <div className="min-h-screen bg-[#F9F9F8] dark:bg-black text-[#111111] dark:text-white flex flex-col font-inter transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/images/logo.png`,
                description: SITE_DESCRIPTION,
              },
              {
                '@type': 'WebSite',
                name: 'ZAPSTERS — The Operating System For Hackathons',
                url: SITE_URL,
                description: SITE_DESCRIPTION,
              },
            ],
          }),
        }}
      />
      <PublicNavbar />

      {/* 1. Hero Section */}
      <section className="w-full py-12 sm:py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Hero Main Copy */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-geist font-light text-[#111111] dark:text-white tracking-tight leading-[1.05] lg:leading-[1.02]">
                The Operating System<br />
                For Hackathons
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#777777] dark:text-neutral-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Run competitions, build team identity, track progress, judge with rubric precision, and broadcast live competition intelligence.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2">
                <Link
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#800000] hover:bg-[#660000] text-white text-sm font-geist font-light uppercase tracking-wider rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  <Search className="w-4 h-4" />
                  Explore Hackathons
                </Link>
                <Link
                  href="/auth/login?role=organizer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#111111] dark:text-white text-sm font-geist font-light uppercase tracking-wider rounded-full transition-all border border-[#E5E5E2] dark:border-neutral-700"
                >
                  <Cpu className="w-4 h-4 text-[#800000]" />
                  Host a Hackathon (Admin)
                </Link>
              </div>
            </div>

            {/* Hero Image Section */}
            <div className="lg:col-span-5 mt-4 lg:mt-0">
              <HeroImage />
            </div>

          </div>
        </div>
      </section>

      {/* 2. How Zapsters Works Section */}
      <section className="py-12 sm:py-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-geist font-bold text-[#111111] dark:text-white">How Zapsters Works</h2>
          <p className="text-base text-[#777777] dark:text-neutral-400 mt-2 font-inter">A connected flow from discovery to final broadcast standings.</p>
        </div>
        <HowItWorksCards />
      </section>

      {/* 3. Featured Hackathons Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-geist font-bold text-[#111111] dark:text-white">Featured Competitions</h2>
              <p className="text-base text-[#777777] dark:text-neutral-400 mt-2 font-inter">High-stakes hackathons active on the platform right now.</p>
            </div>
            <Link href="/explore" className="text-sm font-inter font-bold text-[#800000] hover:underline shrink-0">
              View All Hackathons →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {featuredHackathons.map((h) => (
              <div key={h.id} className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 sm:p-8 space-y-6 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#777777] dark:text-neutral-400 uppercase tracking-wider font-inter">{h.organization}</div>
                  <h3 className="text-xl sm:text-2xl font-geist font-bold text-[#111111] dark:text-white">{h.title}</h3>
                  <p className="text-sm text-[#777777] dark:text-neutral-400 font-inter leading-relaxed">{h.tagline}</p>
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
      <section className="py-16 sm:py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-geist font-bold text-[#111111] dark:text-white">
              Built for Enterprise Hackathon Scale
            </h2>
            <p className="text-base text-[#777777] dark:text-neutral-400 mt-2 font-inter max-w-2xl">
              Zapsters provides complete competition infrastructure for organizers, engineering teams, and judges.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#111111] dark:bg-white hover:bg-[#222222] dark:hover:bg-neutral-200 text-white dark:text-[#111111] text-xs font-inter font-bold uppercase rounded-full inline-flex items-center gap-2 transition-colors shadow-xs shrink-0 w-full sm:w-auto justify-center"
          >
            Launch Participant OS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <InfrastructureCards />
      </section>

      {/* 5. Powering World-Class Organizations */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-geist font-light text-[#111111] dark:text-white tracking-tight">
              Powering World-Class Organizations
            </h2>
          </div>
          <OrganizationCards />
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
