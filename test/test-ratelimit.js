const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/auth/login';
const TOTAL_REQUESTS = 15;
const DELAY = 500; // ms between requests

async function makeRequest(requestNum) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const rateLimit = {
          limit: res.headers['x-ratelimit-limit'],
          remaining: res.headers['x-ratelimit-remaining'],
          reset: res.headers['x-ratelimit-reset']
        };

        console.log(
          `Request ${requestNum}: Status ${res.statusCode} | Remaining: ${rateLimit.remaining}/${rateLimit.limit}`
        );

        if (res.statusCode === 429) {
          const body = JSON.parse(data);
          console.log(`  ⚠️  Rate limited! Retry after: ${body.retryAfter}s`);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`Request ${requestNum} error:`, error.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

async function testRateLimit() {
  console.log(`\n🚀 Testing rate limit on ${BASE_URL}${ENDPOINT}`);
  console.log(`📊 Making ${TOTAL_REQUESTS} requests with ${DELAY}ms delay\n`);

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    await makeRequest(i);
    if (i < TOTAL_REQUESTS) {
      await new Promise(resolve => setTimeout(resolve, DELAY));
    }
  }

  console.log('\n✅ Test complete!\n');
}

testRateLimit();
