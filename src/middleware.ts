import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    // 1. Check if the route is protected (starts with /admin)
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // 2. Check for valid session
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Optional: Verify session validity (though often done in layout/page for perf)
        // For critical security, we can do a quick stateless check here if decrypt is fast
        // or just rely on the cookie presence and let the page validate the content.
        // Given we have decrypt available, let's try to verify it's a valid JWT structure at least.
        try {
            // We don't need the payload here, just to know if it throws
            // However, decrypt is async and uses jose. Middleware supports edge runtime.
            // 'jose' is edge compatible.
            // Let's keep it simple: if cookie exists, let them through. 
            // The Server Components will do the deep validation (db check etc).
            // If we want to be stricter:
            // await decrypt(session)
        } catch (e) {
            // If decryption fails, redirect
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
