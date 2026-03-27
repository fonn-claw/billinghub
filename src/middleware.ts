import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";

interface SessionData {
  userId: string;
  email: string;
  role: "manager" | "billing_clerk" | "customer";
  name: string;
}

// Duplicated here because middleware runs in edge runtime
// and cannot import from session.ts (which uses next/headers)
const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "billinghub-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico"
  ) {
    return res;
  }

  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // No session -> redirect to login
  if (!session.userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Customer role can only access /portal routes
  if (session.role === "customer" && !pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  // Non-customer roles accessing /portal should go to dashboard
  if (session.role !== "customer" && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
