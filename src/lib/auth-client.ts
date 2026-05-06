import { createAuthClient } from "better-auth/react";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";

// Simplified baseURL to prevent Turbopack panics while supporting live site
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const client = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [adminClient(), magicLinkClient()],
});

export const { signIn, signUp, useSession, signOut } = client;
