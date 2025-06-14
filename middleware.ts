import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // This function is only called if the user is authorized.
    // We can use it to handle redirects for authenticated users.
    if (req.nextUrl.pathname.startsWith('/login') && req.nextauth.token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        // Allow access to the login page for unauthenticated users.
        if (pathname.startsWith('/login')) {
          return true;
        }
        // For any other route, require a token.
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/editor/:path*', '/login']
}; 