import { createAuthClient } from "better-auth/react";

// Client-side: use NEXT_PUBLIC_BETTER_AUTH_URL or fallback to current origin
// In Next.js, only NEXT_PUBLIC_* variables are exposed to the browser
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Browser: use public env var or current origin
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || window.location.origin;
  }
  // SSR: fallback (shouldn't happen with better-auth/react, but just in case)
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';
};

export const authClient = createAuthClient({
    baseURL: getBaseURL()
});

export const { signIn, signOut, useSession } = authClient;
