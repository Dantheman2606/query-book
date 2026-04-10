import { NextRequest, NextResponse } from 'next/server';

/**
 * Type for route handler functions
 * Used as the base handler signature for middleware wrappers
 */
export type RouteHandler = (request: NextRequest, context: any) => Promise<NextResponse>;

/**
 * Type for route handler with validated data
 * Used by the validate middleware to pass parsed data to handlers
 */
export type ValidatedRouteHandler = (request: NextRequest, context: any, data: any) => Promise<NextResponse>;

/**
 * Type for route handler with authenticated user
 * Used by auth middleware (withAuth, withAdmin, withFaculty) to pass user data to handlers
 */
export type AuthRouteHandler = (request: NextRequest, context: any, user: any) => Promise<NextResponse>;

/**
 * Type for rate limiter configuration
 * Specifies which rate limiter to use: 'auth' for stricter limits, 'general' for normal limits
 */
export type LimiterType = 'auth' | 'general';
