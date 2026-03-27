import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type Role = "Owner" | "Staff" | "Admin";

function getRoleFromUser(user: { user_metadata?: Record<string, unknown> } | null): Role | null {
  const role = user?.user_metadata?.role;
  if (role === "Owner" || role === "Staff" || role === "Admin") return role;
  return null;
}

function isPublicPath(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

function isAuthRequiredPath(pathname: string) {
  if (isPublicPath(pathname)) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname.startsWith("/favicon")) return false;
  if (pathname.startsWith("/public")) return false;
  // Everything else in this app is protected-by-default.
  return true;
}

function roleHome(role: Role) {
  if (role === "Admin") return "/admin";
  if (role === "Staff") return "/staff";
  return "/owner";
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If env vars are not configured, deny access to protected routes instead of crashing.
  // This prevents runtime failures like "project URL and Key are required".
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { pathname } = request.nextUrl;

  if (!hasSupabaseEnv) {
    if (!isAuthRequiredPath(pathname)) return response;
    // Default-safe behavior when we cannot verify the session.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data } = await supabase.auth.getUser();
  const user = data.user ?? null;
  const role = getRoleFromUser(user);

  // Redirect logged-in users away from auth pages.
  if (user && isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = role ? roleHome(role) : "/owner";
    return NextResponse.redirect(url);
  }

  if (!user && isAuthRequiredPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role gates
  if (pathname.startsWith("/admin")) {
    if (role !== "Admin") return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/staff")) {
    if (role !== "Staff" && role !== "Admin") return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/owner")) {
    if (role !== "Owner" && role !== "Admin") return NextResponse.redirect(new URL("/", request.url));
  }

  // Lost pets access
  if (pathname.startsWith("/lost-pets/admin")) {
    if (role !== "Admin") return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/lost-pets/report")) {
    if (role !== "Owner" && role !== "Staff" && role !== "Admin") return NextResponse.redirect(new URL("/", request.url));
  }

  // Dashboard shortcut
  if (pathname === "/dashboard") {
    const url = request.nextUrl.clone();
    url.pathname = role ? roleHome(role) : "/owner";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip internal assets, but run on app routes.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};

