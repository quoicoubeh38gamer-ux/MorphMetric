import { createAuthClient } from "better-auth/react";

/**
 * Browser auth client. Talks to /api/auth on the same origin. If accounts
 * aren't enabled yet (no database), calls resolve with a 503 error that the UI
 * surfaces as a friendly message.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
