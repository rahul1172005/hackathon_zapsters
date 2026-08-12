'use client';

import React from 'react';

interface CardConfig {
  step: string;
  badgeBg: string;
  title: string;
  description: string;
  imageSrc: string;
  scale: number;
  xAxis: number;
  yAxis: number;
  mobileScale: number;
  mobileXAxis: number;
  mobileYAxis: number;
}

const CARDS_DATA: CardConfig[] = [
  {
    step: '01',
    badgeBg: 'bg-[#800000]',
    title: 'Explore',
    description:
      'Discover active competitions, inspect track requirements, review timelines, and register with your hacker profile.',
    imageSrc: '/images/12.png',
    scale: 2.30,
    xAxis: 0,
    yAxis: 0,
    mobileScale: 1.40,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
  {
    step: '02',
    badgeBg: 'bg-[#111111] dark:bg-neutral-800',
    title: 'Build',
    description:
      'Form team rosters, manage project tasks, connect GitHub repositories, and lock deliverables in dedicated workspaces.',
    imageSrc: '/images/13.png',
    scale: 2.30,
    xAxis: 0,
    yAxis: -3,
    mobileScale: 1.40,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
  {
    step: '03',
    badgeBg: 'bg-[#800000]',
    title: 'Compete',
    description:
      'Judges evaluate using precision rubric sliders, total scores auto-calculate, and rankings update live.',
    imageSrc: '/images/14.png',
    scale: 2.30,
    xAxis: 0,
    yAxis: -3,
    mobileScale: 1.40,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
];

export function HowItWorksCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {CARDS_DATA.map((card) => (
        <div
          key={card.step}
          className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 md:p-8 space-y-4 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            {/* Step Badge */}
            <div
              className={`w-10 h-10 ${card.badgeBg} text-white font-geist font-bold text-sm flex items-center justify-center rounded-full shadow-xs`}
            >
              {card.step}
            </div>

            {/* Desktop Image — hidden on mobile */}
            <div className="hidden md:flex py-2 items-center justify-center">
              <img
                src={card.imageSrc}
                alt={card.title}
                loading="lazy"
                decoding="async"
                style={{
                  transform: `scale(${card.scale}) translate(${card.xAxis}px, ${card.yAxis}px)`,
                }}
                className="w-36 h-36 object-contain card-image filter drop-shadow-md transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
              />
            </div>

            {/* Mobile Image — hidden on desktop */}
            <div className="flex md:hidden py-2 items-center justify-center">
              <img
                src={card.imageSrc}
                alt={card.title}
                loading="lazy"
                decoding="async"
                style={{
                  transform: `scale(${card.mobileScale}) translate(${card.mobileXAxis}px, ${card.mobileYAxis}px)`,
                }}
                className="w-28 h-28 object-contain card-image filter drop-shadow-md transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
              />
            </div>

            {/* Title & Description */}
            <h3 className="text-xl md:text-2xl font-geist font-bold text-[#111111] dark:text-white">{card.title}</h3>
            <p className="text-sm text-[#777777] dark:text-neutral-400 leading-relaxed font-inter">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
