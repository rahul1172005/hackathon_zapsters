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
  mobileScale: number;
  mobileXAxis: number;
  mobileYAxis: number;
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
    mobileScale: 1.0,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
  {
    id: 'ouantum',
    name: 'Ouantum',
    url: 'https://www.ouantum.com/',
    displayUrl: 'www.ouantum.com',
    imageSrc: '/images/ouantum.png',
    fallbackLetter: 'O',
    badgeBg: 'bg-[#111111] dark:bg-neutral-800',
    scale: 1.0,
    xAxis: 0,
    yAxis: 0,
    mobileScale: 1.0,
    mobileXAxis: 0,
    mobileYAxis: 0,
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
    mobileScale: 1.0,
    mobileXAxis: 0,
    mobileYAxis: 0,
  },
];

export function OrganizationCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 font-inter">
      {ORGANIZATIONS_DATA.map((org) => (
        <div
          key={org.id}
          className="bg-[#FFFFFF] dark:bg-[#141414] border border-[#E5E5E2] dark:border-neutral-800 p-6 md:p-8 space-y-6 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            {/* Desktop Image Container */}
            <div className="hidden md:flex py-4 items-center justify-center min-h-[180px]">
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

            {/* Mobile Image Container */}
            <div className="flex md:hidden py-3 items-center justify-center min-h-[140px]">
              {org.imageSrc ? (
                <img
                  src={org.imageSrc}
                  alt={org.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    transform: `scale(${org.mobileScale}) translate(${org.mobileXAxis}px, ${org.mobileYAxis}px)`,
                  }}
                  className="max-h-32 w-auto object-contain card-image filter drop-shadow-md transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
                />
              ) : (
                <div
                  className={`w-16 h-16 ${org.badgeBg} text-white font-geist font-bold text-2xl flex items-center justify-center rounded-2xl shadow-xs`}
                >
                  {org.fallbackLetter}
                </div>
              )}
            </div>

            {/* Organization Name & Link */}
            <h3 className="text-2xl md:text-3xl font-geist font-light text-[#111111] dark:text-white tracking-tight">
              {org.name}
            </h3>
            <div>
              <a
                href={org.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-inter text-[#800000] dark:text-red-400 font-bold hover:underline"
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
