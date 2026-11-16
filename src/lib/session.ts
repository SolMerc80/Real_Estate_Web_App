import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionPayload = {
  name?: string;
  userId: number;
  email: string;
  role: string;
  expiresAt: Date;
};

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("Fatal: SESSION_SECRET environment variable is missing in production.");
}

const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-change-in-production";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    if (!session) return null;
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error("Failed to verify session:", error);
    return null;
  }
}

export async function createSession(name: string, userId: number, email: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ name, userId, email, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  return await decrypt(sessionCookie);
}

/**
 * Defense-in-depth helper for API route handlers and server actions.
 * Ensures the caller is authenticated and (optionally) possesses an authorized role.
 */
export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession();

  if (!session) {
    return {
      authenticated: false as const,
      authorized: false as const,
      session: null,
      errorResponse: { message: "Unauthorized. Authentication required." },
      status: 401 as const,
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      authenticated: true as const,
      authorized: false as const,
      session,
      errorResponse: { message: "Forbidden. Insufficient permissions." },
      status: 403 as const,
    };
  }

  return {
    authenticated: true as const,
    authorized: true as const,
    session,
    errorResponse: null,
    status: 200 as const,
  };
}
