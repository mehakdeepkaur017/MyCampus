import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require ADMIN role
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  // Paths that require STUDENT role
  const isStudentPath = pathname.startsWith("/dashboard") || pathname.startsWith("/api/student");
  // Auth paths (login/register)
  const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/admin/login");

  const token = request.cookies.get("token")?.value;
  const payload = await verifyToken(token);

  // If user is trying to access protected paths without a token
  if (!payload && (isAdminPath || isStudentPath)) {
    // If it's an API route, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Otherwise redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user has a token
  if (payload) {
    // STRICT RBAC: Prevent Student from accessing Admin routes
    if (isAdminPath && payload.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }
      return NextResponse.rewrite(new URL("/403", request.url));
    }

    // STRICT RBAC: Prevent Admin from accessing Student routes (Optional but good practice)
    if (isStudentPath && payload.role !== "STUDENT") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPath) {
      if (payload.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
