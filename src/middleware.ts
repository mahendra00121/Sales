import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!token && !isLoginPage) {
    // Agar token nahi hai aur user login page par nahi hai, toh login par bhejo
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isLoginPage) {
    // Agar user logged in hai aur login page access karne ki koshish kar raha hai, toh dashboard par bhejo
    return NextResponse.redirect(new URL('/master-data', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Yahan hum Next.js ke static files aur api routes ko exclude kar rahe hain
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
