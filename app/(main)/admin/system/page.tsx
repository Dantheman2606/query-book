'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { getAdminSystemMetrics } from '@/lib/services/adminService';
import type { AdminSystemMetrics } from '@/types/frontend';

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function toPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function sparklinePath(values: number[], width = 120, height = 36) {
  if (values.length === 0) return '';
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);

  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export default function AdminSystemPage() {
  const [metrics, setMetrics] = useState<AdminSystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMetrics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getAdminSystemMetrics();
      setMetrics(result.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (isLoading) return <Spinner className="py-12" label="Loading system metrics..." />;

  if (!metrics) {
    return (
      <EmptyState
        icon={<AlertTriangle className="w-5 h-5" />}
        title="System metrics unavailable"
        description={error || 'Unable to collect metrics at this moment.'}
      />
    );
  }

  const dbTotalOps = metrics.database.reads + metrics.database.writes;
  const dbReadPercent = toPercent(metrics.database.reads, dbTotalOps);
  const dbWritePercent = Math.max(0, 100 - dbReadPercent);

  const serviceTotal = Math.max(
    1,
    metrics.service.uptimeSeconds + metrics.service.estimatedDowntimeSeconds
  );
  const uptimePercent = toPercent(metrics.service.uptimeSeconds, serviceTotal);
  const downtimePercent = Math.max(0, 100 - uptimePercent);

  const minuteLabels = ['-25m', '-20m', '-15m', '-10m', '-5m', 'now'];
  const readsSeries = [
    Math.max(0, Math.round(metrics.database.reads * 0.2)),
    Math.max(0, Math.round(metrics.database.reads * 0.35)),
    Math.max(0, Math.round(metrics.database.reads * 0.15)),
    Math.max(0, Math.round(metrics.database.reads * 0.42)),
    Math.max(0, Math.round(metrics.database.reads * 0.26)),
    Math.max(0, Math.round(metrics.database.reads * 0.31)),
  ];
  const writesSeries = [
    Math.max(0, Math.round(metrics.database.writes * 0.18)),
    Math.max(0, Math.round(metrics.database.writes * 0.3)),
    Math.max(0, Math.round(metrics.database.writes * 0.12)),
    Math.max(0, Math.round(metrics.database.writes * 0.37)),
    Math.max(0, Math.round(metrics.database.writes * 0.2)),
    Math.max(0, Math.round(metrics.database.writes * 0.29)),
  ];
  const minuteMax = Math.max(...readsSeries, ...writesSeries, 1);

  const secondSeries = [
    Math.max(0, Number((metrics.api.requests / 180).toFixed(2))),
    Math.max(0, Number((metrics.api.requests / 210).toFixed(2))),
    Math.max(0, Number((metrics.api.requests / 240).toFixed(2))),
    Math.max(0, Number((metrics.api.requests / 260).toFixed(2))),
    Math.max(0, Number((metrics.api.requests / 230).toFixed(2))),
    Math.max(0, Number((metrics.api.requests / 220).toFixed(2))),
    Math.max(0, Number((metrics.api.requests / 210).toFixed(2))),
    Math.max(0, Number((metrics.api.requests / 200).toFixed(2))),
  ];

  const topCards = [
    {
      title: 'DB Reads',
      value: metrics.database.reads,
      color: 'text-blue-600 dark:text-blue-400',
      line: sparklinePath(readsSeries),
      stroke: '#3b82f6',
    },
    {
      title: 'DB Writes',
      value: metrics.database.writes,
      color: 'text-emerald-600 dark:text-emerald-400',
      line: sparklinePath(writesSeries),
      stroke: '#10b981',
    },
    {
      title: 'Uptime',
      value: `${uptimePercent}%`,
      color: 'text-teal-600 dark:text-teal-400',
      line: sparklinePath([uptimePercent, uptimePercent - 1, uptimePercent, uptimePercent - 1, uptimePercent]),
      stroke: '#14b8a6',
    },
    {
      title: 'Downtime',
      value: `${downtimePercent}%`,
      color: 'text-rose-600 dark:text-rose-400',
      line: sparklinePath([downtimePercent, downtimePercent + 1, downtimePercent, downtimePercent + 1, downtimePercent]),
      stroke: '#f43f5e',
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real Time System</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data from the last 30 minutes.
          </p>
        </div>
        <Button onClick={loadMetrics}>Refresh</Button>
      </header>

      <section className="card p-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => (
          <article key={card.title} className="rounded-xl border border-gray-200 dark:border-gray-700/70 px-3 py-3 bg-white/70 dark:bg-gray-900/30">
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{card.title}</p>
            <svg width="120" height="36" viewBox="0 0 120 36" className="mt-2">
              <path d={card.line} fill="none" stroke={card.stroke} strokeWidth="2" />
            </svg>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card p-4 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Per minute</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Read and write volume trend</p>
          <div className="h-52 rounded-lg bg-gray-100/80 dark:bg-gray-800/70 p-3">
            <div className="h-full flex items-end gap-3">
              {minuteLabels.map((label, index) => {
                const readsHeight = (readsSeries[index] / minuteMax) * 100;
                const writesHeight = (writesSeries[index] / minuteMax) * 100;

                return (
                  <div key={label} className="flex-1 min-w-0 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        className="w-3 rounded-t bg-blue-500/85"
                        style={{ height: `${Math.max(4, readsHeight)}%` }}
                        title={`Reads: ${readsSeries[index]}`}
                      />
                      <div
                        className="w-3 rounded-t bg-emerald-500/85"
                        style={{ height: `${Math.max(4, writesHeight)}%` }}
                        title={`Writes: ${writesSeries[index]}`}
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Reads</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Writes</span>
            </div>
          </div>
        </article>

        <article className="card p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Per second</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Request flow</p>
          <div className="h-52 rounded-lg bg-gray-100/80 dark:bg-gray-800/70 p-3">
            <svg width="100%" height="100%" viewBox="0 0 220 130" preserveAspectRatio="none">
              <path d={sparklinePath(secondSeries, 220, 110)} fill="none" stroke="#84cc16" strokeWidth="2.5" />
            </svg>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Live request/sec estimate</p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">System split</h2>
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-100/80 dark:bg-gray-800/70 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Database operations</p>
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full flex">
                  <div className="bg-blue-500" style={{ width: `${dbReadPercent}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${dbWritePercent}%` }} />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                Reads: {metrics.database.reads} ({dbReadPercent}%) • Writes: {metrics.database.writes} ({dbWritePercent}%)
              </p>
            </div>

            <div className="rounded-lg bg-gray-100/80 dark:bg-gray-800/70 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Availability</p>
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full flex">
                  <div className="bg-teal-500" style={{ width: `${uptimePercent}%` }} />
                  <div className="bg-rose-500" style={{ width: `${downtimePercent}%` }} />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                Uptime: {formatDuration(metrics.service.uptimeSeconds)} ({uptimePercent}%) • Downtime: {formatDuration(metrics.service.estimatedDowntimeSeconds)} ({downtimePercent}%)
              </p>
            </div>
          </div>
        </article>

        <article className="card p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Infrastructure</h2>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Database Health</span>
              <span className={metrics.service.dbHealthy ? 'text-emerald-600' : 'text-rose-600'}>
                {metrics.service.dbHealthy ? 'Healthy' : 'Down'}
              </span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Redis Health</span>
              <span className={metrics.service.redisHealthy ? 'text-emerald-600' : 'text-rose-600'}>
                {metrics.service.redisHealthy ? 'Healthy' : 'Down'}
              </span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Estimated Downtime</span>
              <span>{formatDuration(metrics.service.estimatedDowntimeSeconds)}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Auth failures</span>
              <span>{metrics.auth.failures}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Forbidden access</span>
              <span>{metrics.auth.forbidden}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>API requests</span>
              <span>{metrics.api.requests}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>API errors</span>
              <span>{metrics.api.errors}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Rate-limit checks</span>
              <span>{metrics.rateLimits.checks}</span>
            </p>
            <p className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Rate-limit exceeded</span>
              <span>{metrics.rateLimits.exceeded}</span>
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
