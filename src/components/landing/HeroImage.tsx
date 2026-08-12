'use client';

import React from 'react';

interface HeroImageConfig {
  imageSrc: string;
  scale: number;
  xAxis: number;
  yAxis: number;
}

const HERO_IMAGE_CONFIG: HeroImageConfig = {
  imageSrc: '/images/hero.png',
  scale: 1.20,
  xAxis: 0,
  yAxis: 0,
};

export function HeroImage() {
  return (
    <div className="w-full flex items-center justify-center p-2 overflow-visible">
      <img
        src={HERO_IMAGE_CONFIG.imageSrc}
        alt="Zapsters Platform Hero Preview"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{
          transform: `scale(${HERO_IMAGE_CONFIG.scale}) translate(${HERO_IMAGE_CONFIG.xAxis}px, ${HERO_IMAGE_CONFIG.yAxis}px)`,
        }}
        className="w-full h-auto max-w-full object-contain card-image filter drop-shadow-xl transition-all duration-300 dark:brightness-125 dark:contrast-115 dark:saturate-120"
      />
    </div>
  );
}
