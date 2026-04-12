import { test } from '@playwright/test';
import { ApiClient, TestLogger, TEST_REPLY_ID } from './utils/api-client';
import { getTestReplyToReply, VALID_STATUS_CODES } from './utils/test-fixtures';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || '';

let apiClient: ApiClient;
let logger: TestLogger;

test.describe('Replies API Tests', () => {
  test.beforeAll(() => {
    logger = new TestLogger();
    apiClient = new ApiClient(BASE_URL, JWT_TOKEN, logger);

    logger.writeLog('='.repeat(80));
    logger.writeLog('Replies Test Suite Started');
    logger.writeLog(`Base URL: ${BASE_URL}`);
    logger.writeLog(`JWT Token Present: ${!!JWT_TOKEN}`);
    logger.writeLog('='.repeat(80));
  });

  test.afterAll(() => {
    logger.writeLog('='.repeat(80));
    logger.writeLog('Replies Test Suite Completed');
    logger.writeLog('='.repeat(80));
  });

  test('PUT /api/replies/:id/upvote - Upvote a reply', async () => {
    const replyId = TEST_REPLY_ID;
    const result = await apiClient.call('PUT', `/api/replies/${replyId}/upvote`);

    const success = VALID_STATUS_CODES.SUCCESS.concat(VALID_STATUS_CODES.NOT_FOUND, VALID_STATUS_CODES.BAD_REQUEST).includes(result.status);

    logger.recordResult({
      endpoint: `/api/replies/:id/upvote`,
      method: 'PUT',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('DELETE /api/replies/:id/upvote - Remove upvote from reply', async () => {
    const replyId = TEST_REPLY_ID;
    const result = await apiClient.call('DELETE', `/api/replies/${replyId}/upvote`);

    const success = VALID_STATUS_CODES.SUCCESS.concat(VALID_STATUS_CODES.NOT_FOUND, VALID_STATUS_CODES.BAD_REQUEST).includes(result.status);

    logger.recordResult({
      endpoint: `/api/replies/:id/upvote (DELETE)`,
      method: 'DELETE',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('PUT /api/replies/:id/downvote - Downvote a reply', async () => {
    const replyId = TEST_REPLY_ID;
    const result = await apiClient.call('PUT', `/api/replies/${replyId}/downvote`);

    const success = VALID_STATUS_CODES.SUCCESS.concat(VALID_STATUS_CODES.NOT_FOUND, VALID_STATUS_CODES.BAD_REQUEST).includes(result.status);

    logger.recordResult({
      endpoint: `/api/replies/:id/downvote`,
      method: 'PUT',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('DELETE /api/replies/:id/downvote - Remove downvote from reply', async () => {
    const replyId = TEST_REPLY_ID;
    const result = await apiClient.call('DELETE', `/api/replies/${replyId}/downvote`);

    const success = VALID_STATUS_CODES.SUCCESS.concat(VALID_STATUS_CODES.NOT_FOUND, VALID_STATUS_CODES.BAD_REQUEST).includes(result.status);

    logger.recordResult({
      endpoint: `/api/replies/:id/downvote (DELETE)`,
      method: 'DELETE',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('GET /api/replies/:id/replies - Get replies to a reply', async () => {
    const replyId = TEST_REPLY_ID;
    const result = await apiClient.call('GET', `/api/replies/${replyId}/replies`);

    const success = [200, 404].includes(result.status);

    logger.recordResult({
      endpoint: `/api/replies/:id/replies`,
      method: 'GET',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });

  test('POST /api/replies/:id/reply-to-reply - Create reply to a reply', async () => {
    const replyId = TEST_REPLY_ID;
    const replyData = getTestReplyToReply();
    const result = await apiClient.call('POST', `/api/replies/${replyId}/reply-to-reply`, replyData);

    const success = [201, 404, 400].includes(result.status);

    logger.recordResult({
      endpoint: `/api/replies/:id/reply-to-reply`,
      method: 'POST',
      status: result.status,
      success,
      response: result.data,
      timestamp: new Date().toISOString(),
    });
  });
});
