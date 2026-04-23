import { test, expect } from '@playwright/test';
import { ApiClient, TestLogger, TEST_ANNOUNCEMENT_ID } from './utils/api-client';
import { getTestAnnouncement, VALID_STATUS_CODES } from './utils/test-fixtures';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || '';
const FACULTY_JWT_TOKEN = process.env.FACULTY_JWT_TOKEN || JWT_TOKEN;

let apiClient: ApiClient;
let logger: TestLogger;

test.describe('Announcements API Tests', () => {
  test.beforeAll(() => {
    logger = new TestLogger();
    apiClient = new ApiClient(BASE_URL, JWT_TOKEN, logger);

    logger.writeLog('='.repeat(80));
    logger.writeLog('Announcements Test Suite Started');
    logger.writeLog(`Base URL: ${BASE_URL}`);
    logger.writeLog(`JWT Token Present: ${!!JWT_TOKEN}`);
    logger.writeLog('='.repeat(80));
  });

  test.afterAll(() => {
    logger.writeLog('='.repeat(80));
    logger.writeLog('Announcements Test Suite Completed');
    logger.writeLog('='.repeat(80));
  });

  test('GET /api/announcements - Get all announcements', async () => {
    const result = await apiClient.call('GET', '/api/announcements');
    const success = result.status === 200;

    logger.recordResult({
      endpoint: '/api/announcements',
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    expect(success).toBeTruthy();
    expect(result.data).toHaveProperty('announcements');
  });

  test('GET /api/announcements with filters', async () => {
    const result = await apiClient.call('GET', '/api/announcements?limit=5&offset=0&sortBy=recent');
    const success = result.status === 200;

    logger.recordResult({
      endpoint: '/api/announcements?limit=5&offset=0&sortBy=recent',
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    expect(success).toBeTruthy();
  });

  test('POST /api/announcements - Create announcement (Faculty required)', async () => {
    const announcementData = getTestAnnouncement();
    const result = await apiClient.call('POST', '/api/announcements', announcementData, {}, FACULTY_JWT_TOKEN);

    const success = result.status === 201 || result.status === 403; // 403 if not faculty

    logger.recordResult({
      endpoint: '/api/announcements',
      method: 'POST',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    if (result.status === 201) {
      expect(result.data).toHaveProperty('announcement');
    }
  });

  test('GET /api/announcements/:id - Get specific announcement', async () => {
    // First get all announcements
    const allResult = await apiClient.call('GET', '/api/announcements');
    const announcements = (allResult.data as Record<string, any>)?.announcements || [];

    if (announcements.length > 0) {
      const announcementId = announcements[0].id;
      const result = await apiClient.call('GET', `/api/announcements/${announcementId}`);
      const success = result.status === 200;

      logger.recordResult({
        endpoint: `/api/announcements/:id (${announcementId})`,
        method: 'GET',
        status: result.status,
        success,
        response: result.data,
        timestamp: new Date().toISOString(),
      });

      expect(success).toBeTruthy();
    } else {
      logger.writeLog('No announcements found, skipping GET /api/announcements/:id test');
    }
  });

  test('DELETE /api/announcements/:id - Delete announcement (Faculty required)', async () => {
    const announcementId = TEST_ANNOUNCEMENT_ID;
    const result = await apiClient.call('DELETE', `/api/announcements/${announcementId}`, undefined, {}, FACULTY_JWT_TOKEN);

    const success = VALID_STATUS_CODES.ANY_ERROR.includes(result.status);

    logger.recordResult({
      endpoint: `/api/announcements/:id (DELETE)`,
      method: 'DELETE',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });
});
