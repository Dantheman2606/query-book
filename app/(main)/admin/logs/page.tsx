'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { getAdminLogs } from '@/lib/services/adminService';
import type { AdminAuditLog } from '@/types/frontend';

const suspiciousActions = new Set(['auth_failed', 'forbidden', 'rate_limit_exceeded', 'db_error']);

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const loadLogs = async (nextOffset = offset) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getAdminLogs({ limit: 20, offset: nextOffset, search: debouncedSearch });
      setLogs(result.logs);
      setTotal(result.total);
      setLimit(result.limit);
      setOffset(result.offset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(0);
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recent User Actions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Investigate suspicious patterns and review system-level behavior.
          </p>
        </div>
        <Button onClick={() => loadLogs(offset)} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
      </header>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by action, path, user, or IP..."
        leftIcon={<Search className="w-4 h-4" />}
      />

      {isLoading ? (
        <Spinner className="py-12" label="Loading logs..." />
      ) : error ? (
        <EmptyState
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Unable to load logs"
          description={error}
        />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="w-5 h-5" />}
          title="No logs found"
          description="Try a different search query or refresh the logs."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100/90 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Time</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Action</th>
                  <th className="text-left px-4 py-2.5 font-semibold">User</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Path</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                  <th className="text-left px-4 py-2.5 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-gray-100 dark:border-gray-700/60 text-gray-700 dark:text-gray-200"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                          suspiciousActions.has(log.action)
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                        }`}
                      >
                        {log.action}
                      </span>
                      {log.details && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{log.details}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <p>{log.userName || 'Anonymous'}</p>
                      {log.userEmail && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{log.userEmail}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{log.path || '-'}</td>
                    <td className="px-4 py-2.5">{log.statusCode ?? '-'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{log.ip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4">
            <Pagination total={total} limit={limit} offset={offset} onOffset={(nextOffset) => loadLogs(nextOffset)} />
          </div>
        </div>
      )}
    </div>
  );
}
