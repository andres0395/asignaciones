import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'access-secret');

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/auth/login') ||
    pathname.includes('/api/auth/register') ||
    pathname.includes('/api/auth/refresh') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check for token in Authorization header (API) or Cookie (Pages - if implemented that way, but here we likely rely on client side redirect or getServerSideProps, but middleware is extra layer)
  // For API routes specifically:
  if (pathname.startsWith('/api')) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // Allow
    return NextResponse.next();
  }

  // For protected pages (dashboard)
  // We can't easily verify access token in cookie because we store it in memory/localstorage on client usually.
  // Unless we decide to store access token in cookie too?
  // The requirement says "Auth with JWT (access token)". Usually access token is returned.
  // If we want middleware protection for pages, we need the token in a cookie.
  // But commonly with Next.js + JWT:
  // 1. Refresh token in HttpOnly cookie.
  // 2. Access token in memory (from refresh endpoint).
  // 3. User visits page -> Client checks if logged in -> if not, tries refresh -> if fails, redirects to login.
  // Middleware can only check what's in the request. If access token is not in cookie, middleware can't check it for page navigation.
  // So middleware usually checks for refresh token presence? Or we just rely on client-side protection + server-side props verification.
  // However, prompting "Implementa middleware de Next.js para proteger rutas privadas".
  // This implies using middleware.
  // If I only have Refresh Token in cookie, I can verify it?
  // Yes, I can verfiy refresh token in middleware if I want.

  // Let's check for refresh token in cookie for page routes
  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (!refreshToken && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
