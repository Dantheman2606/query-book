import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { withRateLimit } from '@/middleware/rateLimiter';
import { RegisterSchema, type Register } from '@/schemas/auth';

/**
 * Validates user registration data (email, password, etc.)
 * Checks if user already exists in database
 * Hashes the password
 * Creates a new user record with verification token
 * Sends verification email
 * Returns user details (without password)
 *
 * Route: POST /api/auth/register
 * Auth Required: No
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      // Parse request body
      const body = await request.json();

      // Validate against schema
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

      // Prevent admin registration
      if (data.role === 'admin') {
        return NextResponse.json(
          { message: 'You cannot register as admin' },
          { status: 403 }
        );
      }

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already registered.' },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await hash(data.password, 10);

      // Generate verification token (32 bytes = 64 hex characters)
      const verificationToken = randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new user
      const newUser = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role === 'faculty' ? 'faculty' : 'student',
          department: data.department || '',
          avatarUrl: data.avatarUrl || '',
          bio: data.bio || '',
          isVerified: false,
          isActive: true,
          verificationToken,
          verificationTokenExpiry,
        },
      });

      // TODO: Send verification email
      // await sendVerificationEmail(newUser.email, verificationToken);

      // Return user details (without password)
      return NextResponse.json(
        {
          message: 'User registered successfully. Please check your email to verify your account.',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department,
            avatarUrl: newUser.avatarUrl,
            bio: newUser.bio,
            isVerified: newUser.isVerified,
            createdAt: newUser.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Registration error:', error);

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
