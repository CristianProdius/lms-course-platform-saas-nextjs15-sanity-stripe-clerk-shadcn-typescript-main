import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/employee-join",
  "/api/auth",
  "/api/webhook",
  "/api/stripe-checkout/webhook",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For now, we'll handle authentication at the component level
  // Better Auth doesn't support Edge Runtime in middleware yet
  // This is a limitation we need to work around
  
  // Check for Better Auth session cookies
  // Better Auth uses "better-auth.session_token" by default
  const sessionToken = request.cookies.get("better-auth.session_token")?.value || 
                       request.cookies.get("__session")?.value;
  
  if (!sessionToken) {
    // No session token, redirect to sign-in
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check if this is a platform admin trying to access dashboard
  if (pathname === "/dashboard") {
    // Get the session to check user email
    // For now, we'll do a simple redirect for platform admins
    // This is a temporary solution until we can properly check the user
    const response = NextResponse.next();
    response.headers.set("x-platform-admin-check", "true");
    return response;
  }

  // For protected routes, let components handle organization checks
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};