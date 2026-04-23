import NextAuth, { type NextAuthOptions, type Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from './db';
import { JWT } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

type SessionUserWithClaims = NonNullable<Session['user']> & {
  id: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const isPasswordMatch = await compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.isVerified,
          isActive: user.isActive,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        const sessionUser = session.user as SessionUserWithClaims;
        sessionUser.id = token.id as string;
        sessionUser.role = token.role as string;
        sessionUser.emailVerified = token.emailVerified as boolean;
        sessionUser.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers } = NextAuth(authOptions);

/**
 * Helper function to get the current authenticated user
 * Tries NextAuth session first, then checks for JWT in Authorization header
 * This supports both cookie-based and token-based authentication
 */
export async function getCurrentUser(request?: NextRequest) {
  try {
    // First try to get NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const sessionUser = session.user as SessionUserWithClaims;
      if (!sessionUser.emailVerified) {
        console.log('User email not verified');
        return null;
      }
      console.log('Got user from NextAuth session');
      return session.user;
    }

    // If no session, check for JWT in Authorization header
    let authHeader = '';
    if (request) {
      authHeader = request.headers.get('authorization') || '';
    } else {
      // In page routes, use headers() from next/headers
      try {
        const { headers } = await import('next/headers');
        const headersList = await headers();
        authHeader = headersList.get('authorization') || '';
      } catch {
        // headers() not available in this context
      }
    }

    console.log('Auth header:', authHeader ? 'present' : 'missing');

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7); // Remove 'Bearer ' prefix
      const secret = new TextEncoder().encode(
        process.env.NEXTAUTH_SECRET || 'default_development_secret_key_change_in_production'
      );

      try {
        const verified = await jwtVerify(token, secret);
        
        // Check if user email is verified
        if (!verified.payload.isVerified) {
          console.log('User email not verified');
          return null;
        }
        
        console.log('JWT verified successfully');
        return {
          id: verified.payload.id as string,
          email: verified.payload.email as string,
          name: verified.payload.name as string,
          role: verified.payload.role as string,
          emailVerified: verified.payload.isVerified as boolean,
          isActive: verified.payload.isActive as boolean,
        };
      } catch (error) {
        console.error('JWT validation failed:', error);
        return null;
      }
    }

    console.log('No valid auth header or session found');
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}