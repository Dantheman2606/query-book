/**
 * Common test fixtures and utilities
 */

export const getTestAnnouncement = () => ({
  title: `Test Announcement ${Date.now()}`,
  content: 'This is a test announcement',
  isPinned: false,
});

export const getTestQuery = () => ({
  title: `Test Query ${Date.now()}`,
  content: 'This is a test query for the API',
  tags: ['test'],
});

export const getTestReply = () => ({
  content: `Test reply ${Date.now()}`,
});

export const getTestReplyToReply = () => ({
  content: `Test reply-to-reply ${Date.now()}`,
});

export const getTestUserUpdate = () => ({
  name: `Updated User ${Date.now()}`,
  email: `test-${Date.now()}@example.com`,
});

export const getTestDeleteData = () => ({
  password: 'test-password',
});

/**
 * Status codes that indicate successful endpoint responses
 * (not necessarily successful operations, but valid API responses)
 */
export const VALID_STATUS_CODES = {
  SUCCESS: [200, 201],
  NOT_FOUND: [404],
  BAD_REQUEST: [400],
  FORBIDDEN: [403],
  UNAUTHORIZED: [401],
  SERVER_ERROR: [500],
  ANY_ERROR: [400, 403, 404, 500],
};
