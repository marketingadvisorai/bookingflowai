import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GiftCardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const orgId = typeof sp.orgId === 'string' ? sp.orgId : undefined;
  const success = sp.success === 'true';
  const giftCardId = typeof sp.giftCardId === 'string' ? sp.giftCardId : undefined;

  let orgName = 'Gift Card';
  if (orgId) {
    try {
      const org = await getDb().getOrg(orgId);
      if (org?.name) orgName = org.name;
    } catch { /* ignore */ }
  }

  const { GiftCardPurchase } = await import('./GiftCardPurchase');

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-[#1a1a1d]">
      <div className="mx-auto max-w-lg px-4 py-8">
        <GiftCardPurchase
          orgId={orgId}
          orgName={orgName}
          initialSuccess={success}
          initialGiftCardId={giftCardId}
        />
      </div>
    </div>
  );
}
