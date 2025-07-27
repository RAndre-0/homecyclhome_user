import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Routes nécessitant d'être authentifiées
const PROTECTED_ROUTES = ['/profile'];

export function middleware(request: NextRequest) {
  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;
  if (!TOKEN_NAME) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  const token = request.cookies.get(TOKEN_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  if (!PROTECTED_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwt.decode(token) as JwtPayload;

    // Vérifie expiration du token
    if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

  } catch (err) {
    console.warn('Échec décodage JWT :', err);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile'],
};
