import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { isAllowedGoogleEmail, isGoogleAuthConfigured } from "@/features/auth/auth-readiness";
import { googleAuthorizationParams } from "@/features/auth/google-oauth";
import { getServerEnv } from "@/lib/env";

const env = getServerEnv();
const googleAuthConfigured = isGoogleAuthConfigured(env);

export const authConfig = {
  providers: googleAuthConfigured
    ? [
        Google({
          authorization: {
            params: googleAuthorizationParams
          }
        })
      ]
    : [],
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin"
  },
  callbacks: {
    signIn({ profile }) {
      if (!googleAuthConfigured) {
        return false;
      }

      return isAllowedGoogleEmail(profile?.email, env);
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
