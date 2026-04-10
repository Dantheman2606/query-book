import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import type { ValidatedRouteHandler } from '@/types/middleware';

/**
 * Higher-order function that wraps a Next.js API route handler with Zod validation.
 * Validates the request body against a schema and passes parsed data to the handler.
 *
 * @param schema - Zod schema for validating the request body
 * @param handler - The original route handler function
 * @returns A wrapped handler that validates the request body
 *
 * @example
 * export const POST = validate(CreateQuerySchema, async (request, context, data) => {
 *   // data is guaranteed to match CreateQuerySchema
 *   return NextResponse.json({ created: true });
 * });
 */
export function validate(schema: ZodSchema, handler: ValidatedRouteHandler) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Parse request body as JSON
      const body = await request.json();

      // Validate against schema
      const result = schema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            fields: result.error.flatten().fieldErrors,
          },
          { status: 422 }
        );
      }

      // Call handler with validated data
      return handler(request, context, result.data);
    } catch (error) {
      // Handle JSON parse errors
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }

      // Re-throw unexpected errors
      throw error;
    }
  };
}