// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)", // Catch-all for sign-in routes
  "/sign-up(.*)", // Catch-all for sign-up routes
  "/employee-join(.*)", // Employee invitation routes
  "/api/validate-invitation", // ADD THIS - Invitation validation endpoint
  "/api/accept-org-invitation", // ADD THIS - Accept invitation endpoint
  "/api/link-user-to-organization", // ADD THIS - Link user to org endpoint
  "/api/webhook(.*)", // Webhook endpoints
  "/api/clerk-webhook(.*)", // Clerk webhook
  "/api/stripe-checkout/webhook", // Stripe webhook
  "/studio(.*)", // Sanity Studio
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
