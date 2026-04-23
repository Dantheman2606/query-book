import { test, expect } from '@playwright/test';
import { ApiClient, TestLogger, TEST_USER_ID } from './utils/api-client';
import { getTestUserUpdate, getTestDeleteData } from './utils/test-fixtures';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || '';
const ADMIN_JWT_TOKEN = process.env.ADMIN_JWT_TOKEN || JWT_TOKEN;

let apiClient: ApiClient;
let logger: TestLogger;

test.describe('Users API Tests', () => {
  test.beforeAll(() => {
    logger = new TestLogger();
    apiClient = new ApiClient(BASE_URL, JWT_TOKEN, logger);

    logger.writeLog('='.repeat(80));
    logger.writeLog('Users Test Suite Started');
    logger.writeLog(`Base URL: ${BASE_URL}`);
    logger.writeLog(`JWT Token Present: ${!!JWT_TOKEN}`);
    logger.writeLog('='.repeat(80));
  });

  test.afterAll(() => {
    logger.writeLog('='.repeat(80));
    logger.writeLog('Users Test Suite Completed');
    logger.writeLog('='.repeat(80));
  });

  test('GET /api/users - Get all users (Admin required)', async () => {
    const result = await apiClient.call('GET', '/api/users', undefined, {}, ADMIN_JWT_TOKEN);

    const success = [200, 403].includes(result.status); // 403 if not admin

    logger.recordResult({
      endpoint: '/api/users',
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('GET /api/users/:id - Get user profile by ID', async () => {
    const userId = TEST_USER_ID;
    const result = await apiClient.call('GET', `/api/users/${userId}`);

    const success = [200, 404, 400].includes(result.status);

    logger.recordResult({
      endpoint: `/api/users/:id`,
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('GET /api/users/checkUserRole - Check current user role', async () => {
    const result = await apiClient.call('GET', '/api/users/checkUserRole');

    const success = [200, 401].includes(result.status); // 401 if not authenticated

    logger.recordResult({
      endpoint: '/api/users/checkUserRole',
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    if (JWT_TOKEN && result.status === 200) {
      expect(result.data).toHaveProperty('role');
    }
  });

  test('POST /api/users/deleteUserProfile - Delete user account', async () => {
    const deleteData = getTestDeleteData();
    const result = await apiClient.call('POST', '/api/users/deleteUserProfile', deleteData);

    const success = [200, 401, 400].includes(result.status);

    logger.recordResult({
      endpoint: '/api/users/deleteUserProfile',
      method: 'POST',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('PUT /api/users/updateUserProfile - Update user profile', async () => {
    const updateData = getTestUserUpdate();
    const result = await apiClient.call('PUT', '/api/users/updateUserProfile', updateData);

    const success = [200, 401, 400].includes(result.status);

    logger.recordResult({
      endpoint: '/api/users/updateUserProfile',
      method: 'PUT',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });
});
