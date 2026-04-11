import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { db } from '@/lib/db';
import { withRateLimit } from '@/middleware/rateLimiter';
import { LoginSchema, type Login } from '@/schemas/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'default_development_secret_key_change_in_production'
);

/**
 * Validates credentials (email, password)
 * Checks if user exists and password matches (using bcrypt)
 * Generates JWT token
 * Returns token and user info
 *
 * Route: POST /api/auth/login
 * Auth Required: No
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      // Parse request body
      const body = await request.json();

      // Validate against schema
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

      // Find user by email
      const user = await db.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check if user account is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Account is inactive. Please contact support.' },
          { status: 403 }
        );
      }

      // Compare passwords
      const isPasswordMatch = await compare(data.password, user.password);

      if (!isPasswordMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = await new SignJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      // Return token and user info (without password)
      return NextResponse.json(
        {
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Login error:', error);

      // Handle JSON parse errors
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  },
  { type: 'auth' }
);
