import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  if (request.auth) return NextResponse.next();

  const login = new URL("/login", request.nextUrl.origin);
  login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
});

export const config = {
  matcher: ["/sell/:path*", "/profile/:path*", "/office", "/office/:path*"],
};
