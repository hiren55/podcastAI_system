import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);
const requiresLogin = createRouteMatcher(['/discover(.*)', '/playlists(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;
  if (requiresLogin(req)) {
    auth().protect();
    return;
  }
  // All other routes remain protected as before
  auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};