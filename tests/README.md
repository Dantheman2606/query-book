# API Tests Guide

Quick reference for running API tests with Playwright.

## Prerequisites

- Node.js installed
- Dependencies installed: `npm install`
- Query-Book API running: `npm run dev`
- Valid JWT token in `.env` file (`JWT_TOKEN=your_token_here`)

## Quick Start

### 1. Set Your Test IDs

Edit `tests/utils/api-client.ts` (lines 6-9) with real IDs from your database:

```typescript
export let TEST_QUERY_ID = 'your-real-query-id';
export let TEST_REPLY_ID = 'your-real-reply-id';
export let TEST_ANNOUNCEMENT_ID = 'your-real-announcement-id';
export let TEST_USER_ID = 'your-real-user-id';
```

**How to get IDs:**
- Query ID: `GET /api/queries` → copy `id` from response
- Reply ID: `GET /api/queries/:id` → copy reply `id`
- Announcement ID: `GET /api/announcements` → copy `id`
- User ID: Get current user from JWT or `GET /api/users/checkUserRole`

### 2. Ensure JWT Token is Set

Make sure `.env` has your valid JWT token:

```bash
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Run Tests

```bash
# Run all tests
npm run test:api

# Interactive debug mode
npm run test:api:debug

# UI mode (visual test runner)
npm run test:api:ui

# Specific test file
npx playwright test queries.test.ts
```

## Test Structure

```
tests/
├── announcements.test.ts   # Announcement endpoints (5 tests)
├── queries.test.ts          # Query endpoints (9 tests)
├── tags.test.ts             # Tag endpoints (2 tests)
├── replies.test.ts          # Reply endpoints (6 tests)
├── users.test.ts            # User endpoints (5 tests)
│
└── utils/
    ├── api-client.ts        # API client, logger, test IDs
    └── test-fixtures.ts     # Test data generators
```

## Test Results

Results are automatically saved to:

- **Log file**: `test-logs/api-test-YYYY-MM-DD.log`
  - Human-readable format
  - Includes request/response data
  - Timestamped entries

- **JSON results**: `test-logs/api-results-YYYY-MM-DD.json`
  - Machine-readable format
  - Full response objects
  - Structured data

## Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT_TOKEN in .env is valid |
| 404 Not Found | Update TEST_*_ID with real IDs |
| Port 3000 in use | Start API: `npm run dev` |
| Module not found | Install deps: `npm install` |

## View Test Report

After running tests:

```bash
npx playwright show-report
```

This opens an HTML report with detailed test results.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_TOKEN` | Bearer token for API authentication |
| `ADMIN_JWT_TOKEN` | Admin token for admin-only tests (optional) |
| `FACULTY_JWT_TOKEN` | Faculty token for faculty-only tests (optional) |
| `BASE_URL` | API base URL (default: http://localhost:3000) |

## Notes

- Tests use `Date.now()` for unique data creation
- Placeholder IDs return 404 (expected)
- Some tests require specific roles
- Log files contain full response bodies for debugging
