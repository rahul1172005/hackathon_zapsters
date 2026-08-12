import React from 'react';
import { TeamStatus } from '@/types';

interface TeamStatusBadgeProps {
  status: TeamStatus;
  className?: string;
}

export const TeamStatusBadge: React.FC<TeamStatusBadgeProps> = ({ status, className = '' }) => {
  const styles: Record<TeamStatus, { bg: string; text: string; label: string }> = {
    ACTIVE: {
      bg: 'bg-[#111111] border-[#111111]',
      text: 'text-white',
      label: 'ACTIVE',
    },
    IDLE: {
      bg: 'bg-neutral-100 border-neutral-300',
      text: 'text-neutral-700',
      label: 'IDLE',
    },
    AT_RISK: {
      bg: 'bg-[#800000]/10 border-[#800000]/30',
      text: 'text-[#800000]',
      label: 'AT RISK',
    },
    SUBMITTED: {
      bg: 'bg-[#800000] border-[#800000]',
      text: 'text-white',
      label: 'SUBMITTED',
    },
    JUDGING: {
      bg: 'bg-neutral-200 border-neutral-300',
      text: 'text-neutral-800',
      label: 'JUDGING',
    },
    DISQUALIFIED: {
      bg: 'bg-neutral-100 border-neutral-300',
      text: 'text-neutral-400',
      label: 'DISQUALIFIED',
    },
  };

  const style = styles[status] || styles.ACTIVE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase border rounded-full ${style.bg} ${style.text} ${className}`}
    >
      {style.label}
    </span>
  );
};
