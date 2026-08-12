'use client';

import React from 'react';

interface InfraCardConfig {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  // Desktop transform
  scale: number;
  xAxis: number;
  yAxis: number;
  // Mobile transform (applied on sm and below)
  mobileScale: number;
  mobileXAxis: number;
  mobileYAxis: number;
}

const INFRA_CARDS_DATA: InfraCardConfig[] = [
  {
    id: 'organizer-command-center',
    title: 'Organizer Command Center',
    description:
      'Real-time track management, automated participant verification, live operational status, and broadcast controls.',
    imageSrc: '/images/8.png',
    scale: 1.850,
    xAxis: 0,
    yAxis: -5,
    mobileScale: 1.0,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
  {
    id: 'live-telemetry-workspaces',
    title: 'Live Telemetry Workspaces',
    description:
      'Integrated GitHub commit activity, contribution percentage splits, task assignments, and submission locking.',
    imageSrc: '/images/9.png',
    scale: 1.80,
    xAxis: 0,
    yAxis: -5,
    mobileScale: 1.05,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
  {
    id: 'audited-rubric-engine',
    title: 'Audited Rubric Engine',
    description:
      'Multi-criterion slider scoring, conflict resolution logging, criteria weighting, and automated score totals.',
    imageSrc: '/images/10.png',
    scale: 1.80,
    xAxis: 0,
    yAxis: -5,
    mobileScale: 1.05,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
  {
    id: 'developer-identity',
    title: 'Developer Identity & Proof of Work',
    description:
      'Immutable builder profile history, verified prize badges, repository architecture specs, and team rosters.',
    imageSrc: '/images/11.png',
    scale: 1.750,
    xAxis: 0,
    yAxis: -5,
    mobileScale: 1.05,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
];

export function InfrastructureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 font-inter">
      {INFRA_CARDS_DATA.map((card) => (
        <div
          key={card.id}
          className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 md:p-8 space-y-5 md:space-y-6 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            {/* Desktop image — hidden on mobile */}
            <div className="hidden md:flex py-4 items-center justify-center min-h-[220px] overflow-hidden">
              <img
                src={card.imageSrc}
                alt={card.title}
                loading="lazy"
                decoding="async"
                style={{
                  transform: `scale(${card.scale}) translate(${card.xAxis}px, ${card.yAxis}px)`,
                }}
                className="max-h-52 w-auto object-contain card-image filter drop-shadow-md transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
              />
            </div>

            {/* Mobile image — hidden on md+ */}
            <div className="flex md:hidden py-3 items-center justify-center min-h-[160px] overflow-hidden">
              <img
                src={card.imageSrc}
                alt={card.title}
                loading="lazy"
                decoding="async"
                style={{
                  transform: `scale(${card.mobileScale}) translate(${card.mobileXAxis}px, ${card.mobileYAxis}px)`,
                }}
                className="max-h-40 w-auto object-contain card-image filter drop-shadow-md transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
              />
            </div>

            {/* Title & Description */}
            <h3 className="text-xl md:text-2xl font-geist font-bold text-[#111111] dark:text-white">{card.title}</h3>
            <p className="text-sm text-[#777777] dark:text-neutral-400 leading-relaxed">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
