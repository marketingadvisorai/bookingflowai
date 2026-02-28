import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextPath = typeof sp.next === 'string' ? sp.next : '/dashboard';
  return <LoginForm nextPath={nextPath} />;
}
