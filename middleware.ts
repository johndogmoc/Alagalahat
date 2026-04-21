import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type Role = "Owner" | "Staff" | "Admin" | "SuperAdmin";

function getRoleFromUser(user: { user_metadata?: Record<string, unknown> } | null): Role | null {
  const role = user?.user_metadata?.role;
  if (role === "Owner" || role === "Staff" || role === "Admin" || role === "SuperAdmin") return role;
  return null;
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/update-password" ||
    pathname === "/help" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/pet/") ||
    pathname.startsWith("/care-guide") ||
    pathname.startsWith("/api/location")
  );
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
  if (role === "SuperAdmin" || role === "Admin") return "/admin";
  if (role === "Staff") return "/staff";
  return "/home";
}

function redirectToRoleHome(request: NextRequest, role: Role | null) {
  const url = request.nextUrl.clone();
  url.pathname = role ? roleHome(role) : "/login";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If env vars are not configured, deny access to protected routes instead of crashing.
  // This prevents runtime failures like "project URL and Key are required".
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  
  // Strip quotes if they somehow remained (can happen in some environments)
  const cleanUrl = supabaseUrl.replace(/^["']|["']$/g, '');
  const cleanKey = supabaseKey.replace(/^["']|["']$/g, '');

  const hasSupabaseEnv = Boolean(cleanUrl) && Boolean(cleanKey);

  const supabase = createServerClient(
    cleanUrl,
    cleanKey,
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

  let user = null;
  let role: Role | null = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
    role = getRoleFromUser(user);
  } catch (err) {
    console.error("Supabase auth error in middleware:", err);
    // Continue with user = null
  }

  // Redirect logged-in users away from auth pages and the landing page.
  const isAuthOnlyPage = pathname === "/login" || pathname === "/login/admin" || pathname === "/register" || pathname === "/";
  if (user && isAuthOnlyPage) {
    const url = request.nextUrl.clone();
    url.pathname = role ? roleHome(role) : "/home";
    return NextResponse.redirect(url);
  }

  if (!user && isAuthRequiredPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role gates
  if (pathname.startsWith("/super-admin")) {
    if (role !== "SuperAdmin") return redirectToRoleHome(request, role);
  }
  if (pathname.startsWith("/admin")) {
    if (role !== "SuperAdmin" && role !== "Admin") return redirectToRoleHome(request, role);
  }
  if (pathname.startsWith("/staff")) {
    if (role !== "Staff" && role !== "Admin" && role !== "SuperAdmin") return redirectToRoleHome(request, role);
  }
  if (pathname.startsWith("/home")) {
    if (role !== "Owner") return redirectToRoleHome(request, role);
  }
  if (pathname.startsWith("/owner")) {
    if (role !== "Owner") return redirectToRoleHome(request, role);
  }

  // Lost pets access
  if (pathname.startsWith("/lost-pets/admin")) {
    if (role !== "SuperAdmin" && role !== "Admin") return redirectToRoleHome(request, role);
  }
  if (pathname.startsWith("/lost-pets/report")) {
    if (role !== "Owner" && role !== "Staff" && role !== "Admin" && role !== "SuperAdmin") return redirectToRoleHome(request, role);
  }

  // Dashboard shortcut
  if (pathname === "/dashboard") {
    const url = request.nextUrl.clone();
    url.pathname = role ? roleHome(role) : "/home";
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
