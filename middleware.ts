import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/signup"];

const protectedRoutes = [
  "/dashboard",
  "/projects",
  "/chat",
  "/insights",
  "/upload",
  "/personas",
  "/themes",
  "/opportunities",
  "/reports",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname === "/") {
    return NextResponse.next();
  }

  // Check for authentication on protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Get auth token from cookies or localStorage via headers
    const authHeader = request.headers.get("authorization");
    const authCookie = request.cookies.get("auth_token");
    
    if (!authHeader && !authCookie) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
