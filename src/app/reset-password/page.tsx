import { ResetPasswordForm } from './ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ResetPasswordPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : '';
  return <ResetPasswordForm token={token} />;
}
