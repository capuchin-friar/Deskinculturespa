import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ADMIN_PAGES = new Set(["/admin/login", "/admin/signup"]);
const PUBLIC_ADMIN_APIS = new Set([
  "/api/admin/auth/signin",
  "/api/admin/auth/signup",
]);

function isAdminPage(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAdminPage(pathname) && !isAdminApi(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PAGES.has(pathname) || PUBLIC_ADMIN_APIS.has(pathname)) {
    return NextResponse.next();
  }

  const adminToken = request.cookies.get("admin_token")?.value;
  if (adminToken) {
    return NextResponse.next();
  }

  if (isAdminApi(pathname)) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
