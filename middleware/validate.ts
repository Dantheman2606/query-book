// Zod request body validation middleware
// Usage: export const POST = validate(CreateQuerySchema, handler)
//
// Logic:
// - Call request.json() to parse body
// - Run schema.safeParse(body)
// - If invalid: return NextResponse.json(
//     { error: 'Validation failed', fields: zodError.flatten().fieldErrors },
//     { status: 422 }
//   )
// - If valid: call handler with request and parsed data attached
// - Catch JSON parse errors separately — return 400 if body is not valid JSON