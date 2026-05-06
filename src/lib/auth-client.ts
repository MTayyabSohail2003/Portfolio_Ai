import { createAuthClient } from "better-auth/react";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";

export const client = createAuthClient({
  // Use the current origin on the client side, or fallback to ENV for SSR
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  plugins: [adminClient(), magicLinkClient()],
});

export const { signIn, signUp, useSession, signOut } = client;
