'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  initial: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    authProvider: string;
    createdAt: string;
    picture?: string;
    orgName: string;
    orgPlan: string;
    loginCount: number;
  };
};

export function ProfileForm({ initial }: Props) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwPending, setPwPending] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);

  const isGoogle = initial.authProvider === 'google';

  async function onSaveProfile() {
    setError(null);
    setDone(false);

    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    setPending(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        setError((body?.error as string) ?? 'Save failed');
        return;
      }

      setDone(true);
    } finally {
      setPending(false);
    }
  }

  async function onChangePassword() {
    setPwError(null);
    setPwDone(false);

    if (!currentPassword) {
      setPwError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }

    setPwPending(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        setPwError((body?.error as string) ?? 'Password change failed');
        return;
      }

      setPwDone(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setPwPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
          <CardDescription>Update your profile details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-5">
          {/* Profile Photo (Google users only) */}
          {isGoogle && initial.picture && (
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <img src={initial.picture} alt="Profile" className="h-16 w-16 rounded-full ring-2 ring-border" />
              <div>
                <div className="font-medium text-sm">Profile Photo</div>
                <div className="text-xs text-muted-foreground mt-1">Synced from your Google account</div>
              </div>
            </div>
          )}

          {/* Account Info */}
          <div className="space-y-1 pb-4 border-b border-border">
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-0">
              <span className="break-all text-foreground">{initial.email}</span>
              {isGoogle && (
                <span className="ml-0 inline-flex w-fit items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-300 sm:ml-2">
                  Google
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Member since {new Date(initial.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} •{' '}
              {initial.loginCount} {initial.loginCount === 1 ? 'login' : 'logins'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
            />
            <p className="text-xs text-muted-foreground">Optional. For booking notifications</p>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
          {done && <div className="text-sm text-emerald-600 dark:text-emerald-300">Profile updated successfully</div>}

          <Button type="button" onClick={onSaveProfile} disabled={pending} className="w-full md:w-auto min-h-[44px]">
            {pending ? 'Saving…' : 'Save profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Organization Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Organization</CardTitle>
          <CardDescription>Your workspace settings and subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Workspace name:</span>
              <span className="font-medium">{initial.orgName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium capitalize">{initial.orgPlan}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card — password auth users only */}
      {!isGoogle && (
        <Card className="rounded-xl">
          <CardHeader className="p-5 md:p-6">
            <CardTitle className="text-base font-semibold">Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">
                Current password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
              />
            </div>

            {pwError && <div className="text-sm text-destructive">{pwError}</div>}
            {pwDone && <div className="text-sm text-emerald-600 dark:text-emerald-300">Password changed successfully</div>}

            <Button type="button" onClick={onChangePassword} disabled={pwPending} className="w-full md:w-auto min-h-[44px]">
              {pwPending ? 'Updating…' : 'Change password'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone Card */}
      <Card className="rounded-xl border-destructive/50 bg-destructive/5">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">Delete account</div>
              <div className="text-xs text-muted-foreground mt-1">Permanently delete your account and all data</div>
            </div>
            <Button variant="destructive" className="w-full sm:w-auto min-h-[44px]" disabled>
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
