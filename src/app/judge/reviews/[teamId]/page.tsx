import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ teamId: string }>;
}

export default async function DedicatedJudgeReviewRedirectPage({ params }: Props) {
  const resolvedParams = await params;
  const teamId = resolvedParams?.teamId || 'cyberforge';
  redirect(`/organizer/quantum-build-2026/judging/review/${teamId}`);
}
