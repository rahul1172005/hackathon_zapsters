import React from 'react';
import { ActivityLevel } from '@/types';

interface ActivityIndicatorProps {
  level: ActivityLevel;
  className?: string;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ level, className = '' }) => {
  const configs: Record<ActivityLevel, { text: string; label: string; bars: number; color: string }> = {
    HIGH: { text: 'text-[#800000]', label: 'HIGH', bars: 4, color: 'bg-[#800000]' },
    MEDIUM: { text: 'text-[#111111]', label: 'MEDIUM', bars: 3, color: 'bg-[#111111]' },
    LOW: { text: 'text-[#777777]', label: 'LOW', bars: 2, color: 'bg-[#777777]' },
    INACTIVE: { text: 'text-[#999999]', label: 'INACTIVE', bars: 1, color: 'bg-[#E5E5E2]' },
  };

  const config = configs[level] || configs.HIGH;

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-[10px] ${config.text} ${className}`}>
      <div className="flex items-end gap-0.5 h-3">
        {[1, 2, 3, 4].map((barIndex) => (
          <span
            key={barIndex}
            className={`w-1 rounded-full transition-all ${
              barIndex <= config.bars ? config.color : 'bg-[#E5E5E2]'
            }`}
            style={{ height: `${barIndex * 3}px` }}
          />
        ))}
      </div>
      <span className="font-bold tracking-wider uppercase">{config.label}</span>
    </div>
  );
};
