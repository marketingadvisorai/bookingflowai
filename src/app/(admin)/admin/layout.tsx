import { getSessionFromCookies } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './_components/admin-sidebar';

export const metadata = { title: 'System Admin | BookingFlow' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login?next=/admin');

  const db = getDb();
  const user = await db.getUserById(session.userId);
  const adminEmail = process.env.BF_ADMIN_EMAIL;

  if (!user || !adminEmail || user.email.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-[#FFFDF9] dark:bg-neutral-950">
      <AdminSidebar />
      <main className="flex-1 overflow-auto px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
