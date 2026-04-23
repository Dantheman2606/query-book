import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// ============================================================================
// TEST DATA IDS - Update these with real IDs from your database
// ============================================================================
export let TEST_QUERY_ID = '4effdac3-2f4c-493e-a635-c03e57cc608b'; // Replace with a real query ID from /api/queries
export let TEST_REPLY_ID = 'b41351f4-577e-4f1d-81af-274acb1cad80'; // Replace with a real reply ID from a query
export let TEST_ANNOUNCEMENT_ID = 'c5326857-27d1-4285-8ecf-44a3648d52c9'; // Replace with a real announcement ID
export let TEST_USER_ID = '526355a4-2ffe-4a5b-a99c-99cec0e1073b'; // Replace with a real user ID

// Function to update IDs if needed
export function setTestIds(queryId: string, replyId: string, announcementId: string, userId?: string) {
  TEST_QUERY_ID = queryId;
  TEST_REPLY_ID = replyId;
  TEST_ANNOUNCEMENT_ID = announcementId;
  if (userId) TEST_USER_ID = userId;
}

export interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  response?: unknown;
  error?: string;
  timestamp: string;
}

export interface ApiResponse {
  status: number;
  data: unknown;
}

// Initialize log directory and files
export class TestLogger {
  private logFile: string;
  private resultsFile: string;
  private testResults: TestResult[] = [];

  constructor() {
    const logDir = path.join(__dirname, '../../test-logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logDir, `api-test-${dateStr}.log`);
    this.resultsFile = path.join(logDir, `api-results-${dateStr}.json`);
  }

  writeLog(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage);
  }

  recordResult(result: TestResult): void {
    this.testResults.push(result);
    const summary = `${result.method} ${result.endpoint} - Status: ${result.status} - ${result.success ? '✓ PASS' : '✗ FAIL'}`;
    this.writeLog(summary);
    
    // Log response data
    if (result.response) {
      const responseStr = typeof result.response === 'string' ? result.response : JSON.stringify(result.response, null, 2);
      this.writeLog(`Response: ${responseStr}`);
    }
    if (result.error) {
      this.writeLog(`Error: ${result.error}`);
    }
  }

  finalizeResults(): void {
    fs.writeFileSync(this.resultsFile, JSON.stringify(this.testResults, null, 2));
    this.writeLog(`\nResults saved to: ${this.resultsFile}`);
    this.writeLog(`Log file: ${this.logFile}`);

    const passCount = this.testResults.filter((r) => r.success).length;
    const failCount = this.testResults.filter((r) => !r.success).length;
    this.writeLog(`\nSummary: ${passCount} passed, ${failCount} failed out of ${this.testResults.length} tests`);
  }
}

export class ApiClient {
  private baseUrl: string;
  private jwtToken: string;
  private logger: TestLogger;

  constructor(baseUrl: string, jwtToken: string, logger: TestLogger) {
    this.baseUrl = baseUrl;
    this.jwtToken = jwtToken;
    this.logger = logger;
  }

  async call(
    method: string,
    endpoint: string,
    body?: unknown,
    customHeaders: Record<string, string> = {},
    customToken?: string
  ): Promise<ApiResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = customToken || this.jwtToken;
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const contentType = response.headers.get('content-type');
      let data;
      try {
        data = contentType?.includes('application/json') ? await response.json() : await response.text();
      } catch {
        data = null;
      }

      return { status: response.status, data };
    } catch (error) {
      throw error;
    }
  }

  getLogger(): TestLogger {
    return this.logger;
  }
}
