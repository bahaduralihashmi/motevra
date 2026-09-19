import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(request) {
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/admin") && request.nextauth?.token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/account") && !request.nextauth?.token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }

        if (pathname.startsWith("/account")) {
          return Boolean(token);
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
