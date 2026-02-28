'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import type { Booking, Game } from '@/lib/booking/types';
import { RecommendationsList } from '@/components/ai-guide/recommendations-list';

type DashboardStats = {
  totalBookings: number;
  activeGames: number;
  totalRooms: number;
  revenueCents: number;
};

type DashboardUIProps = {
  stats: DashboardStats;
  recentBookings: Booking[];
  gameById: Map<string, Game>;
  greeting: string;
  hasGames: boolean;
  hasBookings: boolean;
  orgId: string;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DashboardUI({ stats, recentBookings, gameById, greeting, hasGames, hasBookings, orgId }: DashboardUIProps) {
  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-6">
        <h2 className="text-2xl font-semibold">{greeting}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {!hasGames && "Let's get started by adding your first game."}
          {hasGames && !hasBookings && "Share your booking widget to start receiving bookings!"}
          {hasGames && hasBookings && "Here's an overview of your booking activity."}
        </p>
      </div>

      {/* Onboarding Prompts */}
      {!hasGames && (
        <Card className="glass border-[#FF4A00]/30 bg-[#FF4A00]/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Add your first game</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a game to start accepting bookings. It only takes a minute!
                </p>
              </div>
              <Link href="/dashboard/games">
                <Button variant="default">Create Game</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {hasGames && !hasBookings && (
        <Card className="glass border-[#FF4A00]/30 bg-[#FF4A00]/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Share your booking link</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get your embed code and add it to your website to start receiving bookings.
                </p>
              </div>
              <Link href="/dashboard/embed">
                <Button variant="default">Get Embed Code</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="glass">
          <CardContent className="p-4 text-center md:p-6">
            <div className="mb-1 text-sm text-muted-foreground">Total Bookings</div>
            <div className="text-2xl font-semibold md:text-3xl">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 text-center md:p-6">
            <div className="mb-1 text-sm text-muted-foreground">Active Games</div>
            <div className="text-2xl font-semibold md:text-3xl">{stats.activeGames}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 text-center md:p-6">
            <div className="mb-1 text-sm text-muted-foreground">Rooms</div>
            <div className="text-2xl font-semibold md:text-3xl">{stats.totalRooms}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 text-center md:p-6">
            <div className="mb-1 text-sm text-muted-foreground">Revenue</div>
            <div className="text-2xl font-semibold md:text-3xl">{formatCurrency(stats.revenueCents)}</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">AI Insights</CardTitle>
          <CardDescription>Personalized recommendations for your venue</CardDescription>
        </CardHeader>
        <CardContent>
          <RecommendationsList orgId={orgId} />
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest bookings from your customers</CardDescription>
            </div>
            <Link href="/dashboard/bookings">
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center">
              <div className="text-lg font-medium">No bookings yet</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Your first booking will appear here. Share your embed code to start receiving bookings!
              </p>
              <Link href="/dashboard/embed" className="mt-4 inline-block">
                <Button variant="secondary">Get Embed Code</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Players</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell className="text-sm">{formatDate(booking.startAt)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.customer?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{booking.customer?.email || ''}</div>
                        </TableCell>
                        <TableCell>{gameById.get(booking.gameId)?.name ?? booking.gameId}</TableCell>
                        <TableCell>{booking.players}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              booking.status === 'confirmed'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {booking.totalCents ? formatCurrency(booking.totalCents) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {recentBookings.map((booking) => (
                  <div key={booking.bookingId} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="font-medium">{booking.customer?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{booking.customer?.email || ''}</div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Game:</span>
                        <span>{gameById.get(booking.gameId)?.name ?? booking.gameId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{formatDate(booking.startAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Players:</span>
                        <span>{booking.players}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">
                          {booking.totalCents ? formatCurrency(booking.totalCents) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Link href="/dashboard/games" className="block">
              <div className="group cursor-pointer rounded-lg border border-border/50 bg-card/30 p-4 text-center transition-all hover:border-[#FF4A00]/50 hover:bg-card/50">
                <div className="text-sm font-medium">Create Game</div>
              </div>
            </Link>

            <Link href="/dashboard/rooms" className="block">
              <div className="group cursor-pointer rounded-lg border border-border/50 bg-card/30 p-4 text-center transition-all hover:border-[#FF4A00]/50 hover:bg-card/50">
                <div className="text-sm font-medium">Manage Rooms</div>
              </div>
            </Link>

            <Link href="/dashboard/embed" className="block">
              <div className="group cursor-pointer rounded-lg border border-border/50 bg-card/30 p-4 text-center transition-all hover:border-[#FF4A00]/50 hover:bg-card/50">
                <div className="text-sm font-medium">Embed Code</div>
              </div>
            </Link>

            <Link href="/dashboard/settings" className="block">
              <div className="group cursor-pointer rounded-lg border border-border/50 bg-card/30 p-4 text-center transition-all hover:border-[#FF4A00]/50 hover:bg-card/50">
                <div className="text-sm font-medium">Settings</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
