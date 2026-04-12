import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/middleware/rateLimiter';
import { LoginSchema, type Login } from '@/schemas/auth';
import { loginUser } from '@/services/auth.service';

/**
 * Validates credentials (email, password)
 * Returns JWT token and user info
 *
 * Route: POST /api/auth/login
 * Auth Required: No
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const result = LoginSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            fields: result.error.flatten().fieldErrors,
          },
          { status: 422 }
        );
      }

      const data: Login = result.data;
      const authToken = await loginUser(data);

      return NextResponse.json(
        {
          message: 'Login successful',
          token: authToken.token,
          user: authToken.user,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('Invalid') ? 401 : 500;

      return NextResponse.json(
        { message: 'Server error', error: message },
        { status }
      );
    }
  },
  { type: 'auth' }
);
