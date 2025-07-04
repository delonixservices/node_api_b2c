// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the requested path starts with /admin (all admin routes)
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isAdminLoginPath = request.nextUrl.pathname === '/admin/auth/login'
  const isAdminSignUpPath = request.nextUrl.pathname === '/admin/auth/sign-up'

  if (isAdminPath) {
    // Get the admin token from the cookies
    const adminToken = request.cookies.get('admin_token')?.value

    // If the user is not logged in (no admin_token) and is trying to access /admin routes, redirect to login
    // Allow access to login and sign-up pages without token
    if (!adminToken && !isAdminLoginPath && !isAdminSignUpPath) {
      const loginUrl = new URL('/admin/auth/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  } else {
    // For non-admin routes, check regular token
    const token = request.cookies.get('token')?.value
    // Add your non-admin route protection logic here if needed
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Apply middleware only to /admin/* routes (all sub-routes)
export const config = {
  matcher: ['/admin/:path*'],  // This ensures all routes under /admin/* are protected
}
