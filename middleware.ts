import createMiddleware from "next-intl/middleware";
import {NextRequest, NextResponse} from "next/server";

import {AUTH_COOKIE_NAMES, AUTH_ROLES} from "@/config/firebase";
import {locales, routing} from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ADMIN_ROUTE_PATTERN = new RegExp(`^/(?:${locales.join("|")}/)?admin(?:/|$)`);
const LOCALE_PREFIXED_ADMIN_PATTERN = new RegExp(`^/(${locales.join("|")})/admin(?<rest>/.*|$)`);

function isAdminPath(pathname: string): boolean {
  return ADMIN_ROUTE_PATTERN.test(pathname);
}

function getCanonicalAdminPath(pathname: string): string | null {
  const match = pathname.match(LOCALE_PREFIXED_ADMIN_PATTERN);

  if (!match) {
    return null;
  }

  const rest = match.groups?.rest ?? "";
  return `/admin${rest}`;
}

function buildAdminRedirect(request: NextRequest, pathname: string): NextResponse {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = "";

  return NextResponse.redirect(target);
}

export default function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;

  const canonicalAdminPath = getCanonicalAdminPath(pathname);
  if (canonicalAdminPath) {
    const target = request.nextUrl.clone();
    target.pathname = canonicalAdminPath;
    return NextResponse.redirect(target);
  }

  if (isAdminPath(pathname)) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAMES.session)?.value;
    const roleCookie = request.cookies.get(AUTH_COOKIE_NAMES.role)?.value;
    const isAuthenticated = Boolean(sessionCookie && roleCookie === AUTH_ROLES.admin);
    const isLoginPath = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
    const isAdminRootPath = pathname === "/admin";

    if (!isAuthenticated && !isLoginPath) {
      return buildAdminRedirect(request, "/admin/login");
    }

    if (isAuthenticated && (isAdminRootPath || isLoginPath)) {
      return buildAdminRedirect(request, "/admin/dashboard");
    }

    // Do not pass admin routes through next-intl middleware.
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};