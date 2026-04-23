type TelemetryAction =
  | 'api_request'
  | 'auth_failed'
  | 'forbidden'
  | 'rate_limit_exceeded'
  | 'rate_limit_error'
  | 'role_change'
  | 'db_error';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: TelemetryAction;
  userId?: string;
  userRole?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  ip?: string;
  details?: string;
}

interface TelemetryCounters {
  apiRequests: number;
  apiErrors: number;
  authFailures: number;
  forbiddenRequests: number;
  rateLimitChecks: number;
  rateLimitExceeded: number;
  rateLimitErrors: number;
  dbReads: number;
  dbWrites: number;
  dbErrors: number;
}

interface TelemetryState {
  startedAt: number;
  counters: TelemetryCounters;
  logs: AuditLogEntry[];
}

const MAX_LOGS = 500;

const globalTelemetry = globalThis as typeof globalThis & {
  __qbTelemetry?: TelemetryState;
};

function initialState(): TelemetryState {
  return {
    startedAt: Date.now(),
    counters: {
      apiRequests: 0,
      apiErrors: 0,
      authFailures: 0,
      forbiddenRequests: 0,
      rateLimitChecks: 0,
      rateLimitExceeded: 0,
      rateLimitErrors: 0,
      dbReads: 0,
      dbWrites: 0,
      dbErrors: 0,
    },
    logs: [],
  };
}

function getState(): TelemetryState {
  if (!globalTelemetry.__qbTelemetry) {
    globalTelemetry.__qbTelemetry = initialState();
  }
  return globalTelemetry.__qbTelemetry;
}

function pushLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const state = getState();
  const now = new Date().toISOString();

  state.logs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: now,
    ...entry,
  });

  if (state.logs.length > MAX_LOGS) {
    state.logs.length = MAX_LOGS;
  }
}

export function classifyDbAction(action: string): 'read' | 'write' | 'other' {
  const readActions = new Set([
    'findUnique',
    'findUniqueOrThrow',
    'findFirst',
    'findFirstOrThrow',
    'findMany',
    'count',
    'aggregate',
    'groupBy',
    'queryRaw',
    'queryRawUnsafe',
  ]);

  const writeActions = new Set([
    'create',
    'createMany',
    'update',
    'updateMany',
    'upsert',
    'delete',
    'deleteMany',
    'executeRaw',
    'executeRawUnsafe',
  ]);

  if (readActions.has(action)) return 'read';
  if (writeActions.has(action)) return 'write';
  return 'other';
}

export function recordDbOperation(action: string, wasError = false) {
  const state = getState();
  const kind = classifyDbAction(action);

  if (kind === 'read') state.counters.dbReads += 1;
  if (kind === 'write') state.counters.dbWrites += 1;

  if (wasError) {
    state.counters.dbErrors += 1;
    pushLog({
      action: 'db_error',
      details: `Database action failed: ${action}`,
    });
  }
}

export function recordApiRequest(payload: {
  method: string;
  path: string;
  statusCode: number;
  userId?: string;
  userRole?: string;
  ip?: string;
}) {
  const state = getState();
  state.counters.apiRequests += 1;

  if (payload.statusCode >= 400) {
    state.counters.apiErrors += 1;
  }

  pushLog({
    action: 'api_request',
    method: payload.method,
    path: payload.path,
    statusCode: payload.statusCode,
    userId: payload.userId,
    userRole: payload.userRole,
    ip: payload.ip,
  });
}

export function recordAuthFailure(payload: {
  method: string;
  path: string;
  ip?: string;
}) {
  const state = getState();
  state.counters.authFailures += 1;

  pushLog({
    action: 'auth_failed',
    method: payload.method,
    path: payload.path,
    statusCode: 401,
    ip: payload.ip,
    details: 'Unauthorized access attempt',
  });
}

export function recordForbidden(payload: {
  method: string;
  path: string;
  userId?: string;
  userRole?: string;
  ip?: string;
}) {
  const state = getState();
  state.counters.forbiddenRequests += 1;

  pushLog({
    action: 'forbidden',
    method: payload.method,
    path: payload.path,
    statusCode: 403,
    userId: payload.userId,
    userRole: payload.userRole,
    ip: payload.ip,
    details: 'Forbidden resource access attempt',
  });
}

export function recordRateLimitCheck(payload: {
  method?: string;
  path?: string;
  ip?: string;
  exceeded: boolean;
  hadError: boolean;
}) {
  const state = getState();
  state.counters.rateLimitChecks += 1;

  if (payload.exceeded) {
    state.counters.rateLimitExceeded += 1;
    pushLog({
      action: 'rate_limit_exceeded',
      method: payload.method,
      path: payload.path,
      statusCode: 429,
      ip: payload.ip,
      details: 'Rate limit exceeded',
    });
  }

  if (payload.hadError) {
    state.counters.rateLimitErrors += 1;
    pushLog({
      action: 'rate_limit_error',
      method: payload.method,
      path: payload.path,
      ip: payload.ip,
      details: 'Rate limiter backend error',
    });
  }
}

export function recordRoleChange(payload: {
  adminId: string;
  targetUserId: string;
  fromRole: string;
  toRole: string;
}) {
  pushLog({
    action: 'role_change',
    userId: payload.adminId,
    userRole: 'admin',
    details: `Changed ${payload.targetUserId} from ${payload.fromRole} to ${payload.toRole}`,
  });
}

export function getRecentLogs(limit = 100): AuditLogEntry[] {
  return getState().logs.slice(0, Math.max(1, Math.min(limit, MAX_LOGS)));
}

export function getTelemetrySnapshot() {
  const state = getState();
  const uptimeSeconds = Math.floor((Date.now() - state.startedAt) / 1000);

  return {
    startedAt: new Date(state.startedAt).toISOString(),
    uptimeSeconds,
    estimatedDowntimeSeconds: 0,
    ...state.counters,
  };
}
