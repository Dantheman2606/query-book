import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/middleware/rateLimiter';
import { VerifyEmailSchema, type VerifyEmail } from '@/schemas/auth';
import { verifyEmail } from '@/services/auth.service';

function getAppUrl(): string {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Verifies user email via URL token click and redirects to login
 *
 * Route: GET /api/auth/verifyEmail?token=...
 * Auth Required: No
 */
export async function GET(request: NextRequest) {
  const appUrl = getAppUrl();
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?verified=missing-token`);
  }

  try {
    await verifyEmail({ token });
    return NextResponse.redirect(`${appUrl}/login?verified=success`);
  } catch {
    return NextResponse.redirect(`${appUrl}/login?verified=invalid`);
  }
}

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
