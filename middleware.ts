import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (login, signup)
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Root path and all other protected routes need auth
  // Get auth token from cookies or check localStorage (client-side will handle localStorage)
  const authCookie = request.cookies.get("auth_token");
  
  // If no auth cookie, redirect to login for protected routes
  if (!authCookie || !authCookie.value) {
    // Allow root to load (client-side auth check will redirect to login if needed)
    if (pathname === "/") {
      return NextResponse.next();
    }
    
    console.log(`No auth cookie found for path ${pathname}, redirecting to login`);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
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

