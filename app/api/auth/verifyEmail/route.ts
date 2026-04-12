import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/middleware/rateLimiter';
import { VerifyEmailSchema, type VerifyEmail } from '@/schemas/auth';
import { verifyEmail } from '@/services/auth.service';

/**
 * Verifies user email with verification token
 * Updates user's isVerified status in database
 *
 * Route: POST /api/auth/verifyEmail
 * Auth Required: No
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const result = VerifyEmailSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            fields: result.error.flatten().fieldErrors,
          },
          { status: 422 }
        );
      }

      const data: VerifyEmail = result.data;
      await verifyEmail(data);

      return NextResponse.json(
        { message: 'Email verified successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Email verification error:', error);

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('Invalid') || message.includes('expired') ? 400 : 500;

      return NextResponse.json(
        { message: 'Server error', error: message },
        { status }
      );
    }
  },
  { type: 'auth' }
);
