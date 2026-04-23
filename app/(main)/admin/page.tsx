'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Database, Users } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { getAdminDashboardAnalytics } from '@/lib/services/adminService';
import type { AdminDashboardAnalytics } from '@/types/frontend';

function pct(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminDashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await getAdminDashboardAnalytics();
        setAnalytics(result.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin analytics');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  if (isLoading) return <Spinner className="py-12" label="Loading dashboard analytics..." />;

  if (!analytics) {
    return (
      <EmptyState
        icon={<AlertTriangle className="w-5 h-5" />}
        title="Unable to load dashboard"
        description={error || 'Analytics data is currently unavailable.'}
      />
    );
  }

  const cards = [
    { label: 'Users', value: analytics.totals.users, icon: Users },
    { label: 'Queries', value: analytics.totals.queries, icon: Database },
    { label: 'Replies', value: analytics.totals.replies, icon: Database },
    { label: 'Tags', value: analytics.totals.tags, icon: Database },
  ];

  const roleTotal = analytics.totals.students + analytics.totals.faculty + analytics.totals.admins;
  const studentPct = pct(analytics.totals.students, roleTotal);
  const facultyPct = pct(analytics.totals.faculty, roleTotal);
  const adminPct = Math.max(0, 100 - studentPct - facultyPct);

  const roleChartStyle = {
    background: `conic-gradient(
      #2563eb 0% ${studentPct}%,
      #0d9488 ${studentPct}% ${studentPct + facultyPct}%,
      #f59e0b ${studentPct + facultyPct}% 100%
    )`,
  };

  const dailyActivity = [
    { key: 'queries', label: 'Queries', value: analytics.activity.queriesToday, color: 'bg-blue-500' },
    { key: 'replies', label: 'Replies', value: analytics.activity.repliesToday, color: 'bg-teal-500' },
    {
      key: 'announcements',
      label: 'Announcements',
      value: analytics.activity.announcementsToday,
      color: 'bg-amber-500',
    },
  ];
  const maxDailyValue = Math.max(...dailyActivity.map((item) => item.value), 1);

  const maxContributorTotal = Math.max(
    ...analytics.topContributors.map((entry) => entry.totalContributions),
    1
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Platform analytics, participation trends, and security signals.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="card p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                <Icon className="h-5 w-5 text-brand-700 dark:text-brand-200" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Role Distribution</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative mx-auto h-36 w-36 rounded-full" style={roleChartStyle}>
              <div className="absolute inset-4 rounded-full bg-white dark:bg-[#101318] flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{roleTotal}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-sm">
              <p className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Students
                </span>
                <span className="font-semibold">{analytics.totals.students} ({studentPct}%)</span>
              </p>
              <p className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Faculty
                </span>
                <span className="font-semibold">{analytics.totals.faculty} ({facultyPct}%)</span>
              </p>
              <p className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Admins
                </span>
                <span className="font-semibold">{analytics.totals.admins} ({adminPct}%)</span>
              </p>
            </div>
          </div>
        </article>

        <article className="card p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Today Activity</h2>
          <div className="space-y-3">
            <div className="h-44 rounded-lg bg-gray-100/80 dark:bg-gray-800/70 px-3 pt-3 pb-2">
              <div className="flex h-full items-end justify-around gap-3">
                {dailyActivity.map((item) => (
                  <div key={item.key} className="flex flex-col items-center gap-1.5 w-full">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.value}</div>
                    <div className="w-full max-w-[52px] h-28 flex items-end">
                      <div
                        className={`w-full rounded-t-md ${item.color}`}
                        style={{ height: `${Math.max(8, (item.value / maxDailyValue) * 100)}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Active users in last 7 days:{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.activity.activeUsersLast7Days}
              </span>
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Top Contributors</h2>
          {analytics.topContributors.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No contributor activity yet.</p>
          ) : (
            <div className="space-y-2">
              {analytics.topContributors.map((entry) => (
                <div
                  key={entry.userId}
                  className="rounded-lg bg-gray-100/80 dark:bg-gray-800/70 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.name}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {entry.totalContributions} total
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.max(6, (entry.totalContributions / maxContributorTotal) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {entry.queries} queries, {entry.replies} replies
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Security Snapshot</h2>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Suspicious events (24h)</span>
              <span className="font-semibold">{analytics.activity.suspiciousEventsLast24h}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Rate-limit exceeded</span>
              <span className="font-semibold">{analytics.telemetry.rateLimitExceeded}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Auth failures</span>
              <span className="font-semibold">{analytics.telemetry.authFailures}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Service uptime</span>
              <span className="font-semibold">{formatUptime(analytics.telemetry.uptimeSeconds)}</span>
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
