import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { isAllowedGoogleEmail, isGoogleAuthConfigured } from "@/features/auth/auth-readiness";
import { getServerEnv } from "@/lib/env";

const env = getServerEnv();
const googleAuthConfigured = isGoogleAuthConfigured(env);

export const authConfig = {
  providers: googleAuthConfigured ? [Google] : [],
  secret: env.AUTH_SECRET,
  trustHost: true,
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
