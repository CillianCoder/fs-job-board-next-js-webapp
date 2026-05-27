import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'devforge-super-secret-key-change-me-in-production'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Get Session Cookie
  const token = request.cookies.get('devforge-session')?.value;
  let session: any = null;
  
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload;
    } catch (e) {
      // Token verification failed or expired
    }
  }

  // 2. Define route categories
  const isAdminRoute = pathname.startsWith('/admin-dashboard');
  const isRecruiterRoute = pathname.startsWith('/recruiter-dashboard');
  const isCandidateRoute = pathname.startsWith('/candidate-dashboard');
  const isSetupRoute = pathname.startsWith('/setup');
  const isAuthRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password');

  // 3. Guests Protection
  if (!session) {
    if (isAdminRoute || isRecruiterRoute || isCandidateRoute || isSetupRoute) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Logged-in User Session Details
  const { role, setupComplete } = session;

  // 4. Authenticated Users attempting to hit Auth pages (login/signup)
  if (isAuthRoute) {
    if (!setupComplete) {
      const setupPath = role === 'CANDIDATE' ? '/setup/candidate' : '/setup/recruiter';
      return NextResponse.redirect(new URL(setupPath, request.url));
    }
    const dashboardPath = 
      role === 'ADMIN' ? '/admin-dashboard' : 
      role === 'EMPLOYER' ? '/recruiter-dashboard' : '/candidate-dashboard';
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // 5. Profile Setup Protection (If profile setup is incomplete)
  if (!setupComplete && role !== 'ADMIN') {
    if (isSetupRoute) {
      const correctSetupPath = role === 'CANDIDATE' ? '/setup/candidate' : '/setup/recruiter';
      if (pathname !== correctSetupPath) {
        return NextResponse.redirect(new URL(correctSetupPath, request.url));
      }
      return NextResponse.next();
    }
    
    if (isAdminRoute || isRecruiterRoute || isCandidateRoute) {
      const setupPath = role === 'CANDIDATE' ? '/setup/candidate' : '/setup/recruiter';
      return NextResponse.redirect(new URL(setupPath, request.url));
    }
    
    return NextResponse.next();
  }

  // 6. Role Boundaries Check (If profile setup is complete)
  if (isAdminRoute && role !== 'ADMIN') {
    const defaultPath = role === 'EMPLOYER' ? '/recruiter-dashboard' : '/candidate-dashboard';
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  if (isRecruiterRoute && role !== 'EMPLOYER') {
    const defaultPath = role === 'ADMIN' ? '/admin-dashboard' : '/candidate-dashboard';
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  if (isCandidateRoute && role !== 'CANDIDATE') {
    const defaultPath = role === 'ADMIN' ? '/admin-dashboard' : '/recruiter-dashboard';
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  // Logged-in completed users should not be allowed to go to setup pages
  if (isSetupRoute) {
    if (role === 'EMPLOYER' && pathname === '/setup/recruiter') {
      return NextResponse.next();
    }

    if (role === 'CANDIDATE' && pathname === '/setup/candidate') {
      return NextResponse.next();
    }

    const dashboardPath = 
      role === 'ADMIN' ? '/admin-dashboard' : 
      role === 'EMPLOYER' ? '/recruiter-dashboard' : '/candidate-dashboard';
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/recruiter-dashboard/:path*',
    '/candidate-dashboard/:path*',
    '/setup/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
