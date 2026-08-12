'use client';

import React from 'react';

interface HeroImageConfig {
  imageSrc: string;
  scale: number;
  xAxis: number;
  yAxis: number;
  mobileScale: number;
  mobileXAxis: number;
  mobileYAxis: number;
}

const HERO_IMAGE_CONFIG: HeroImageConfig = {
  imageSrc: '/images/hero.png',
  scale: 1.20,
  xAxis: 0,
  yAxis: 0,
  mobileScale: 1.0,
  mobileXAxis: 0,
  mobileYAxis: 0,
};

export function HeroImage() {
  return (
    <div className="w-full flex items-center justify-center p-2 overflow-visible">
      {/* Desktop Hero Image */}
      <img
        src={HERO_IMAGE_CONFIG.imageSrc}
        alt="Zapsters Platform Hero Preview"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{
          transform: `scale(${HERO_IMAGE_CONFIG.scale}) translate(${HERO_IMAGE_CONFIG.xAxis}px, ${HERO_IMAGE_CONFIG.yAxis}px)`,
        }}
        className="hidden md:block w-full h-auto max-w-full object-contain card-image filter drop-shadow-xl transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
      />

      {/* Mobile Hero Image */}
      <img
        src={HERO_IMAGE_CONFIG.imageSrc}
        alt="Zapsters Platform Hero Preview"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{
          transform: `scale(${HERO_IMAGE_CONFIG.mobileScale}) translate(${HERO_IMAGE_CONFIG.mobileXAxis}px, ${HERO_IMAGE_CONFIG.mobileYAxis}px)`,
        }}
        className="block md:hidden w-full h-auto max-w-full object-contain card-image filter drop-shadow-xl transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
      />
    </div>
  );
}
