import { analyzeOrgSetup, getIssuesForPage } from '@/lib/ai-guide/analyze-setup';
import { SetupGuideClient } from './setup-guide-client';

type Props = {
  orgId: string;
  page: 'overview' | 'games' | 'rooms' | 'schedules' | 'embed' | 'settings';
};

export async function SetupGuide({ orgId, page }: Props) {
  const { issues, progress } = await analyzeOrgSetup(orgId);
  const pageIssues = getIssuesForPage(issues, page);

  if (pageIssues.length === 0 && (page !== 'overview' || progress.percent === 100)) {
    return null;
  }

  return (
    <SetupGuideClient
      issues={pageIssues}
      progress={page === 'overview' ? progress : undefined}
      showProgress={page === 'overview'}
    />
  );
}
