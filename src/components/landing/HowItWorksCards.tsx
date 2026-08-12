'use client';

import React from 'react';

interface CardConfig {
  step: string;
  badgeBg: string;
  title: string;
  description: string;
  imageSrc: string;
  scale: number;
  xAxis: number; // X axis offset in px
  yAxis: number; // Y axis offset in px
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
  },
  {
    step: '02',
    badgeBg: 'bg-[#111111]',
    title: 'Build',
    description:
      'Form team rosters, manage project tasks, connect GitHub repositories, and lock deliverables in dedicated workspaces.',
    imageSrc: '/images/13.png',
    scale: 2.30,
    xAxis: 0,
    yAxis: -3,
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
  },
];

export function HowItWorksCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {CARDS_DATA.map((card) => (
        <div
          key={card.step}
          className="bg-[#FFFFFF] border border-[#E5E5E2] p-8 space-y-4 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            {/* Step Badge */}
            <div
              className={`w-10 h-10 ${card.badgeBg} text-white font-geist font-bold text-sm flex items-center justify-center rounded-full shadow-xs`}
            >
              {card.step}
            </div>

            {/* Image placed directly in card with scale, X, and Y axis transform attributes */}
            <div className="py-2 flex items-center justify-center">
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

            {/* Title & Description */}
            <h3 className="text-2xl font-geist font-bold text-[#111111]">{card.title}</h3>
            <p className="text-sm text-[#777777] leading-relaxed font-inter">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
