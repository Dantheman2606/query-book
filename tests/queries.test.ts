import { test, expect } from '@playwright/test';
import { ApiClient, TestLogger, TEST_QUERY_ID } from './utils/api-client';
import { getTestQuery, getTestReply, VALID_STATUS_CODES } from './utils/test-fixtures';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || '';

let apiClient: ApiClient;
let logger: TestLogger;

test.describe('Queries API Tests', () => {
  test.beforeAll(() => {
    logger = new TestLogger();
    apiClient = new ApiClient(BASE_URL, JWT_TOKEN, logger);

    logger.writeLog('='.repeat(80));
    logger.writeLog('Queries Test Suite Started');
    logger.writeLog(`Base URL: ${BASE_URL}`);
    logger.writeLog(`JWT Token Present: ${!!JWT_TOKEN}`);
    logger.writeLog('='.repeat(80));
  });

  test.afterAll(() => {
    logger.writeLog('='.repeat(80));
    logger.writeLog('Queries Test Suite Completed');
    logger.writeLog('='.repeat(80));
  });

  test('GET /api/queries - Get all queries', async () => {
    const result = await apiClient.call('GET', '/api/queries');
    const success = result.status === 200;

    logger.recordResult({
      endpoint: '/api/queries',
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    expect(success).toBeTruthy();
    expect(result.data).toHaveProperty('queries');
  });

  test('GET /api/queries with filters', async () => {
    const result = await apiClient.call('GET', '/api/queries?limit=10&offset=0&sortBy=recent&search=test');
    const success = result.status === 200;

    logger.recordResult({
      endpoint: '/api/queries?limit=10&offset=0&sortBy=recent&search=test',
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    expect(success).toBeTruthy();
  });

  test('POST /api/queries - Create new query', async () => {
    const queryData = getTestQuery();
    const result = await apiClient.call('POST', '/api/queries', queryData);

    const success = result.status === 201;

    logger.recordResult({
      endpoint: '/api/queries',
      method: 'POST',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });

    if (!JWT_TOKEN) {
      expect(result.status).toBe(401); // No token
    } else if (success) {
      expect(result.data).toHaveProperty('query');
    }
  });

  test('GET /api/queries/:id - Get specific query', async () => {
    // First get all queries
    const allResult = await apiClient.call('GET', '/api/queries');
    const queries = (allResult.data as Record<string, any>)?.queries || [];

    if (queries.length > 0) {
      const queryId = queries[0].id;
      const result = await apiClient.call('GET', `/api/queries/${queryId}`);
      const success = result.status === 200;

      logger.recordResult({
        endpoint: `/api/queries/:id (GET)`,
        method: 'GET',
        status: result.status,
        success,
        response: result.data,
        timestamp: new Date().toISOString(),
      });

      expect(success).toBeTruthy();
    } else {
      logger.writeLog('No queries found, skipping GET /api/queries/:id test');
    }
  });

  test('PUT /api/queries/:id/upvote - Upvote a query', async () => {
    const queryId = TEST_QUERY_ID;
    const result = await apiClient.call('PUT', `/api/queries/${queryId}/upvote`);

    const success = VALID_STATUS_CODES.SUCCESS.concat(VALID_STATUS_CODES.NOT_FOUND, VALID_STATUS_CODES.BAD_REQUEST).includes(result.status);

    logger.recordResult({
      endpoint: `/api/queries/:id/upvote`,
      method: 'PUT',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('DELETE /api/queries/:id/upvote - Remove upvote from query', async () => {
    const queryId = TEST_QUERY_ID;
    const result = await apiClient.call('DELETE', `/api/queries/${queryId}/upvote`);

    const success = VALID_STATUS_CODES.SUCCESS.concat(VALID_STATUS_CODES.NOT_FOUND, VALID_STATUS_CODES.BAD_REQUEST).includes(result.status);

    logger.recordResult({
      endpoint: `/api/queries/:id/upvote (DELETE)`,
      method: 'DELETE',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('PUT /api/queries/:id/downvote - Downvote a query', async () => {
    const queryId = TEST_QUERY_ID;
    const result = await apiClient.call('PUT', `/api/queries/${queryId}/downvote`);

    const success = VALID_STATUS_CODES.SUCCESS.concat(VALID_STATUS_CODES.NOT_FOUND, VALID_STATUS_CODES.BAD_REQUEST).includes(result.status);

    logger.recordResult({
      endpoint: `/api/queries/:id/downvote`,
      method: 'PUT',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('DELETE /api/queries/:id/downvote - Remove downvote from query', async () => {
    const queryId = TEST_QUERY_ID;
    const result = await apiClient.call('DELETE', `/api/queries/${queryId}/downvote`);

    const success = VALID_STATUS_CODES.SUCCESS.concat(VALID_STATUS_CODES.NOT_FOUND, VALID_STATUS_CODES.BAD_REQUEST).includes(result.status);

    logger.recordResult({
      endpoint: `/api/queries/:id/downvote (DELETE)`,
      method: 'DELETE',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('GET /api/queries/:id/votes - Get votes for a query', async () => {
    const queryId = TEST_QUERY_ID;
    const result = await apiClient.call('GET', `/api/queries/${queryId}/votes`);

    const success = [200, 404].includes(result.status);

    logger.recordResult({
      endpoint: `/api/queries/:id/votes`,
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('POST /api/queries/:id/reply - Create reply to query', async () => {
    const queryId = TEST_QUERY_ID;
    const replyData = getTestReply();
    const result = await apiClient.call('POST', `/api/queries/${queryId}/reply`, replyData);

    const success = [201, 404, 400].includes(result.status);

    logger.recordResult({
      endpoint: `/api/queries/:id/reply`,
      method: 'POST',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });
});
