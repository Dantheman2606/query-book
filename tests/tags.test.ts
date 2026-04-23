import { test, expect } from '@playwright/test';
import { ApiClient, TestLogger } from './utils/api-client';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || '';

let apiClient: ApiClient;
let logger: TestLogger;

test.describe('Tags API Tests', () => {
  test.beforeAll(() => {
    logger = new TestLogger();
    apiClient = new ApiClient(BASE_URL, JWT_TOKEN, logger);

    logger.writeLog('='.repeat(80));
    logger.writeLog('Tags Test Suite Started');
    logger.writeLog(`Base URL: ${BASE_URL}`);
    logger.writeLog(`JWT Token Present: ${!!JWT_TOKEN}`);
    logger.writeLog('='.repeat(80));
  });

  test.afterAll(() => {
    logger.writeLog('='.repeat(80));
    logger.writeLog('Tags Test Suite Completed');
    logger.writeLog('='.repeat(80));
  });

  test('GET /api/tags - Get all tags', async () => {
    const result = await apiClient.call('GET', '/api/tags');
    const success = result.status === 200;

    logger.recordResult({
      endpoint: '/api/tags',
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    expect(success).toBeTruthy();
  });

  test('GET /api/tags/selectable - Get selectable tags', async () => {
    const result = await apiClient.call('GET', '/api/tags/selectable');
    const success = result.status === 200;

    logger.recordResult({
      endpoint: '/api/tags/selectable',
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    expect(success).toBeTruthy();
  });
});
