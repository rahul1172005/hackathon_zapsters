'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface OrgCardConfig {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  imageSrc?: string;
  fallbackLetter: string;
  badgeBg: string;
  scale: number;
  xAxis: number;
  yAxis: number;
}

const ORGANIZATIONS_DATA: OrgCardConfig[] = [
  {
    id: 'etherence',
    name: 'Etherence',
    url: 'https://www.etherence.com/',
    displayUrl: 'https://www.etherence.com/',
    imageSrc: '/images/etherence.png',
    fallbackLetter: 'E',
    badgeBg: 'bg-[#800000]',
    scale: 1.0,
    xAxis: 0,
    yAxis: 0,
  },
  {
    id: 'ouantum',
    name: 'Ouantum',
    url: 'https://www.ouantum.com/',
    displayUrl: 'www.ouantum.com',
    imageSrc: '/images/ouantum.png',
    fallbackLetter: 'O',
    badgeBg: 'bg-[#111111]',
    scale: 1.0,
    xAxis: 0,
    yAxis: 0,
  },
  {
    id: 'cybercom',
    name: 'Cybercom',
    url: 'https://www.cybercomctf.com/',
    displayUrl: 'https://www.cybercomctf.com/',
    fallbackLetter: 'C',
    badgeBg: 'bg-[#800000]',
    scale: 1.0,
    xAxis: 0,
    yAxis: 0,
  },
];

export function OrganizationCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-inter">
      {ORGANIZATIONS_DATA.map((org) => (
        <div
          key={org.id}
          className="bg-[#FFFFFF] border border-[#E5E5E2] p-8 space-y-6 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            {/* Image container aligned like other cards */}
            <div className="py-4 flex items-center justify-center min-h-[180px]">
              {org.imageSrc ? (
                <img
                  src={org.imageSrc}
                  alt={org.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    transform: `scale(${org.scale}) translate(${org.xAxis}px, ${org.yAxis}px)`,
                  }}
                  className="max-h-44 w-auto object-contain card-image filter drop-shadow-md transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
                />
              ) : (
                <div
                  className={`w-20 h-20 ${org.badgeBg} text-white font-geist font-bold text-3xl flex items-center justify-center rounded-3xl shadow-xs`}
                >
                  {org.fallbackLetter}
                </div>
              )}
            </div>

            {/* Organization Name & Link */}
            <h3 className="text-3xl font-geist font-light text-[#111111] tracking-tight">
              {org.name}
            </h3>
            <div>
              <a
                href={org.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-inter text-[#800000] font-bold hover:underline"
              >
                {org.displayUrl} <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
