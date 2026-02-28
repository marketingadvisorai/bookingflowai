type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

type StatsCardsProps = {
  users: number;
  orgs: number;
  bookings: number;
  totalRevenue: number;
};

export function StatsCards({ users, orgs, bookings, totalRevenue }: StatsCardsProps) {
  const revenue = totalRevenue > 0
    ? `$${(totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : '$0';

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Total Users" value={users} />
      <StatCard label="Total Workspaces" value={orgs} />
      <StatCard label="Total Bookings" value={bookings} />
      <StatCard label="Total Revenue" value={revenue} />
    </div>
  );
}
