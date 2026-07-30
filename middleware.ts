import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { getAuthGuardDecision, isPublicRuntimePath } from "@/features/auth/session-guard";
import { getServerEnv } from "@/lib/env";

type AuthenticatedRequest = NextRequest & {
  auth?: {
    user?: {
      email?: string | null;
    };
  } | null;
};

export default auth((request: AuthenticatedRequest) => {
  const { pathname } = request.nextUrl;

  if (isPublicRuntimePath(pathname)) {
    return NextResponse.next();
  }

  const decision = getAuthGuardDecision(request.auth?.user?.email, getServerEnv());

  if (decision === "allow") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        code: decision === "unauthenticated" ? "auth_required" : "auth_forbidden",
        message:
          decision === "unauthenticated"
            ? "Autenticação Google é necessária para acessar este recurso."
            : "Esta conta Google não está autorizada para este KNOW/OS."
      },
      { status: decision === "unauthenticated" ? 401 : 403 }
    );
  }

  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"]
};
