import { BookNowClient } from './BookNowClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function BookNowPage() {
  // Client-side reading of search params is more reliable across hosts.
  return <BookNowClient />;
}
