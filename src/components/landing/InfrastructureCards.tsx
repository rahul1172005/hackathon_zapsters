'use client';

import React from 'react';

interface InfraCardConfig {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  scale: number;
  xAxis: number;
  yAxis: number;
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
  },
];

export function InfrastructureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter">
      {INFRA_CARDS_DATA.map((card) => (
        <div
          key={card.id}
          className="bg-[#FFFFFF] border border-[#E5E5E2] p-8 space-y-6 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            {/* Image placed directly in card with scale, X, and Y axis transform attributes */}
            <div className="py-4 flex items-center justify-center min-h-[220px]">
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

            {/* Title & Description */}
            <h3 className="text-2xl font-geist font-bold text-[#111111]">{card.title}</h3>
            <p className="text-sm text-[#777777] leading-relaxed">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
