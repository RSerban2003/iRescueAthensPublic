import { NextResponse } from "next/server";
import { ZodType } from "zod";
import { auth } from "@/lib/auth";

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/**
 * Parses and validates a JSON request body. On failure returns a ready-made
 * 400 response with field-level messages and no internal details.
 */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "_";
      if (!fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: parsed.data };
}

/** Returns null when the caller is a signed-in admin, otherwise a 401/403 response. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

/** Logs the real error server-side and returns a generic 500 to the client. */
export function serverError(error: unknown, publicMessage = "Something went wrong"): NextResponse {
  console.error("[api]", publicMessage, error);
  return NextResponse.json({ error: publicMessage }, { status: 500 });
}

export function notFound(message = "Not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}
