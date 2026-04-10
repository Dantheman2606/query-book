import NextAuth, { type NextAuthOptions, type Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from './db';
import { JWT } from 'next-auth/jwt';

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

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);

/**
 * Helper function to get the current authenticated user
 * Calls the NextAuth auth() function and returns session.user or null
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}