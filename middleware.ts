/**
 * Route Protection Middleware
 * 
 * Handles route-based access control including:
 * - Authentication verification for protected routes
 * - Role-based access control for admin areas
 * - Redirect logic for authenticated/unauthenticated users
 */
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const { pathname } = req.nextUrl

  // Admin route protection - requires ADMIN or EMPLOYEE role
  if (pathname.startsWith("/admin")) {
    if (!token || (token.role !== "ADMIN" && token.role !== "EMPLOYEE")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Reservations route protection
  if (pathname.startsWith("/reservations")) {
    if (!token && pathname === "/reservations") {
      return NextResponse.next()
    } else if (!token && pathname !== "/reservations/new") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Prevent authenticated users from accessing login/register pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/reservations/:path*", "/login", "/register"],
}