import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET});

    const protectedPaths = ['/Dashboard', '/CompletedTasks', '/Tasks'];
    const url = req.nextUrl.clone();

    if (protectedPaths.includes(req.nextUrl.pathname)) {
        if (!token) {
            url.pathname = '/Auth';  // Redirect to login/signup page
            return NextResponse.redirect(url);
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/Dashboard', '/CompletedTasks'],
};
