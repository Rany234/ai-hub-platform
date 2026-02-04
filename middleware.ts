import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

function getRedirectUrl(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.searchParams.set("redirectedFrom", req.nextUrl.pathname);
  return url;
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup");
  const isOnboardingRoute = req.nextUrl.pathname.startsWith("/onboarding");

  // If user is not logged in, protect /app routes (you can expand this list).
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/account");

  if (!user && isProtected) {
    return NextResponse.redirect(getRedirectUrl(req, "/login"));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(getRedirectUrl(req, "/"));
  }

  // Role onboarding guard: logged in but no role -> redirect to role selection
  // Exclusions: onboarding itself (avoid loop) and auth callback (PKCE exchange)
  const pathname = req.nextUrl.pathname;
  const isAuthCallback = pathname.startsWith("/auth/callback");

  if (user && !isOnboardingRoute && !isAuthCallback) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile?.role) {
      return NextResponse.redirect(new URL("/onboarding/role", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
