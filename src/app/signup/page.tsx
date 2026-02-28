import { SignupForm } from './SignupForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // Default new users into onboarding.
  const nextPath = typeof sp.next === 'string' ? sp.next : '/onboarding';
  return <SignupForm nextPath={nextPath} />;
}
