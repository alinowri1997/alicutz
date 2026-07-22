import createMiddleware from "next-intl/middleware";
import {NextRequest, NextResponse} from "next/server";

import {AUTH_COOKIE_NAMES, AUTH_ROLES} from "@/config/firebase";
import {defaultLocale, locales, routing} from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ADMIN_ROUTE_PATTERN = new RegExp(`^/(?:${locales.join("|")}/)?admin(?:/|$)`);

function isAdminPath(pathname: string): boolean {
  return ADMIN_ROUTE_PATTERN.test(pathname);
}

function resolveLocaleFromPath(pathname: string): string {
  const pathSegments = pathname.split("/").filter(Boolean);
  const maybeLocale = pathSegments[0];

  return locales.includes(maybeLocale as (typeof locales)[number]) ? maybeLocale : defaultLocale;
}

function getUnauthorizedRedirect(request: NextRequest): NextResponse {
  const locale = resolveLocaleFromPath(request.nextUrl.pathname);
  const target = request.nextUrl.clone();
  target.pathname = `/${locale}`;
  target.search = "";

  return NextResponse.redirect(target);
}

export default function proxy(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  if (isAdminPath(request.nextUrl.pathname)) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAMES.session)?.value;
    const roleCookie = request.cookies.get(AUTH_COOKIE_NAMES.role)?.value;

    if (!sessionCookie || roleCookie !== AUTH_ROLES.admin) {
      return getUnauthorizedRedirect(request);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};