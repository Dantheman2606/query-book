import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/middleware/rateLimiter';
import { RegisterSchema, type Register } from '@/schemas/auth';
import { registerUser } from '@/services/auth.service';

/**
 * Registers a new user
 * Creates user record with verification token
 * Returns user details (without password)
 *
 * Route: POST /api/auth/register
 * Auth Required: No
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const result = RegisterSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            fields: result.error.flatten().fieldErrors,
          },
          { status: 422 }
        );
      }

      const data: Register = result.data;
      const newUser = await registerUser(data);

      return NextResponse.json(
        {
          message: 'User registered successfully. Please check your email to verify your account.',
          user: newUser,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('cannot') ? 403 : message.includes('already') ? 409 : 500;

      return NextResponse.json(
        { message: 'Server error', error: message },
        { status }
      );
    }
  },
  { type: 'auth' }
);
