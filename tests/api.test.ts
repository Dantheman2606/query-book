/**
 * API TEST SUITE - REFACTORED FOR MODULARITY
 * 
 * This file has been reorganized into separate, focused test files for better
 * maintainability and readability. Each test module handles a specific feature area.
 * 
 * FILES STRUCTURE:
 * ├── tests/
 * │   ├── announcements.test.ts   # Announcements API tests
 * │   ├── queries.test.ts          # Queries API tests
 * │   ├── tags.test.ts             # Tags API tests
 * │   ├── replies.test.ts          # Replies API tests
 * │   ├── users.test.ts            # Users API tests
 * │   └── utils/
 * │       ├── api-client.ts        # API client and logging utilities
 * │       └── test-fixtures.ts     # Test data and common helpers
 * 
 * IMPROVEMENTS MADE:
 * ✓ Fixed: GET /api/replies/:id/replies test description (was POST, should be GET)
 * ✓ Modular: Separated tests by feature area
 * ✓ DRY: Centralized API client and logging logic
 * ✓ Reusable: Common test data in fixtures
 * ✓ Testable: Each module can run independently
 * ✓ Maintainable: Easier to add new tests
 * 
 * RUNNING TESTS:
 * 
 * All tests:      npm run test:api
 * Debug mode:     npm run test:api:debug
 * UI mode:        npm run test:api:ui
 * 
 * Specific suite: npx playwright test announcements.test.ts
 *                 npx playwright test queries.test.ts
 *                 npx playwright test tags.test.ts
 *                 npx playwright test replies.test.ts
 *                 npx playwright test users.test.ts
 * 
 * JWT TOKEN SETUP:
 * 
 * Before running tests, set your JWT token:
 * 
 * Windows (PowerShell):
 *   $env:JWT_TOKEN = "your-token-here"
 * 
 * Mac/Linux (Bash/Zsh):
 *   export JWT_TOKEN="your-token-here"
 * 
 * Results saved to:
 * - test-logs/api-test-YYYY-MM-DD.log
 * - test-logs/api-results-YYYY-MM-DD.json
 */
