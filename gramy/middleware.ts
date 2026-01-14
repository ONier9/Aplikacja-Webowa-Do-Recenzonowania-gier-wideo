import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set(name, value, options);
        },
        remove(name, options) {
          response.cookies.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("banned")
      .eq("id", user.id)
      .single();

    if (profile?.banned && !request.nextUrl.pathname.startsWith("/banned")) {
      return NextResponse.redirect(new URL("/banned", request.url));
    }

    if (!profile?.banned && request.nextUrl.pathname.startsWith("/banned")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware]", {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      userId: user?.id,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};