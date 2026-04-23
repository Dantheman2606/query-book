import { db } from '@/lib/db';
import { getRecentLogs, getTelemetrySnapshot, recordRoleChange } from '@/lib/adminTelemetry';
import { redis } from '@/utils/redis';

interface Contributor {
  userId: string;
  name: string;
  queries: number;
  replies: number;
  totalContributions: number;
  score: number;
}

export async function getAdminDashboardAnalytics() {
  const [
    totalUsers,
    totalQueries,
    totalReplies,
    totalAnnouncements,
    totalTags,
    students,
    faculty,
    admins,
  ] = await Promise.all([
    db.user.count(),
    db.query.count(),
    db.reply.count(),
    db.announcement.count(),
    db.tag.count(),
    db.user.count({ where: { role: 'student' } }),
    db.user.count({ where: { role: 'faculty' } }),
    db.user.count({ where: { role: 'admin' } }),
  ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [queriesToday, repliesToday, announcementsToday, activeUsers, topContributors] =
    await Promise.all([
      db.query.count({ where: { datePosted: { gte: startOfDay } } }),
      db.reply.count({ where: { datePosted: { gte: startOfDay } } }),
      db.announcement.count({ where: { datePosted: { gte: startOfDay } } }),
      getActiveUsersCount(sevenDaysAgo),
      getTopContributors(),
    ]);

  const telemetry = getTelemetrySnapshot();

  return {
    totals: {
      users: totalUsers,
      students,
      faculty,
      admins,
      queries: totalQueries,
      replies: totalReplies,
      announcements: totalAnnouncements,
      tags: totalTags,
    },
    activity: {
      queriesToday,
      repliesToday,
      announcementsToday,
      activeUsersLast7Days: activeUsers,
      suspiciousEventsLast24h: telemetry.rateLimitExceeded + telemetry.forbiddenRequests,
    },
    topContributors,
    telemetry,
  };
}

async function getActiveUsersCount(since: Date): Promise<number> {
  const [queryUsers, replyUsers, announcementUsers] = await Promise.all([
    db.query.findMany({ where: { datePosted: { gte: since } }, select: { userId: true } }),
    db.reply.findMany({ where: { datePosted: { gte: since } }, select: { userId: true } }),
    db.announcement.findMany({ where: { datePosted: { gte: since } }, select: { userId: true } }),
  ]);

  const activeSet = new Set<string>();
  queryUsers.forEach((item) => activeSet.add(item.userId));
  replyUsers.forEach((item) => activeSet.add(item.userId));
  announcementUsers.forEach((item) => activeSet.add(item.userId));

  return activeSet.size;
}

async function getTopContributors(): Promise<Contributor[]> {
  const [queryAgg, replyAgg] = await Promise.all([
    db.query.groupBy({ by: ['userId'], _count: { userId: true } }),
    db.reply.groupBy({ by: ['userId'], _count: { userId: true } }),
  ]);

  const scores = new Map<string, { queries: number; replies: number }>();

  for (const item of queryAgg) {
    const existing = scores.get(item.userId) || { queries: 0, replies: 0 };
    existing.queries = item._count.userId;
    scores.set(item.userId, existing);
  }

  for (const item of replyAgg) {
    const existing = scores.get(item.userId) || { queries: 0, replies: 0 };
    existing.replies = item._count.userId;
    scores.set(item.userId, existing);
  }

  const ranked = [...scores.entries()]
    .map(([userId, value]) => ({
      userId,
      queries: value.queries,
      replies: value.replies,
      totalContributions: value.queries + value.replies,
      score: value.queries + value.replies,
    }))
    .sort((a, b) => b.totalContributions - a.totalContributions)
    .slice(0, 5);

  if (ranked.length === 0) return [];

  const users = await db.user.findMany({
    where: { id: { in: ranked.map((entry) => entry.userId) } },
    select: { id: true, name: true },
  });

  const nameById = new Map(users.map((user) => [user.id, user.name]));

  return ranked.map((entry) => ({
    ...entry,
    name: nameById.get(entry.userId) || 'Unknown User',
  }));
}

export async function getAdminAuditLogs(options?: { limit?: number; offset?: number; search?: string }) {
  const limit = Math.min(200, Math.max(1, options?.limit ?? 50));
  const offset = Math.max(0, options?.offset ?? 0);
  const search = options?.search?.trim().toLowerCase();

  const allLogs = getRecentLogs(500);

  const filteredLogs = search
    ? allLogs.filter((log) => {
        const haystack = [
          log.action,
          log.method || '',
          log.path || '',
          log.ip || '',
          log.details || '',
          log.userId || '',
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      })
    : allLogs;

  const pagedLogs = filteredLogs.slice(offset, offset + limit);
  const userIds = [...new Set(pagedLogs.map((log) => log.userId).filter(Boolean))] as string[];

  const users =
    userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

  const userMap = new Map(users.map((user) => [user.id, user]));

  const logs = pagedLogs.map((log) => ({
    ...log,
    userName: log.userId ? userMap.get(log.userId)?.name || 'Unknown User' : null,
    userEmail: log.userId ? userMap.get(log.userId)?.email || null : null,
  }));

  return {
    logs,
    total: filteredLogs.length,
    limit,
    offset,
    hasMore: offset + limit < filteredLogs.length,
  };
}

export async function promoteStudentToFaculty(targetUserId: string, adminUserId: string) {
  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatarUrl: true,
      bio: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!target) {
    throw new Error('User not found');
  }

  if (target.role === 'admin') {
    throw new Error('Cannot change role of an admin user');
  }

  if (target.role === 'faculty') {
    return target;
  }

  if (target.role !== 'student') {
    throw new Error('Only student users can be promoted');
  }

  const updatedUser = await db.user.update({
    where: { id: targetUserId },
    data: { role: 'faculty' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatarUrl: true,
      bio: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  recordRoleChange({
    adminId: adminUserId,
    targetUserId,
    fromRole: target.role,
    toRole: 'faculty',
  });

  return updatedUser;
}

export async function getAdminSystemMetrics() {
  const telemetry = getTelemetrySnapshot();

  let dbHealthy = true;
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbHealthy = false;
  }

  const redisHealthy = !!redis.isReady;

  return {
    service: {
      startedAt: telemetry.startedAt,
      uptimeSeconds: telemetry.uptimeSeconds,
      estimatedDowntimeSeconds: telemetry.estimatedDowntimeSeconds,
      dbHealthy,
      redisHealthy,
    },
    database: {
      reads: telemetry.dbReads,
      writes: telemetry.dbWrites,
      errors: telemetry.dbErrors,
    },
    rateLimits: {
      checks: telemetry.rateLimitChecks,
      exceeded: telemetry.rateLimitExceeded,
      errors: telemetry.rateLimitErrors,
    },
    auth: {
      failures: telemetry.authFailures,
      forbidden: telemetry.forbiddenRequests,
    },
    api: {
      requests: telemetry.apiRequests,
      errors: telemetry.apiErrors,
    },
  };
}
