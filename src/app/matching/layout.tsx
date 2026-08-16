import type { Metadata } from 'next';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';

export const metadata: Metadata = {
  title: 'Team Matching — ZAPSTERS',
  description: 'Find teammates by skill, join the matchmaking pool, and browse the participant directory.',
};

export default function MatchingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
