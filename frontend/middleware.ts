import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    if (pathname === '/' && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (pathname.startsWith('/auth') && token) {
        return NextResponse.redirect(new URL('/', request.url))
    }

}

export const config = {
    matcher: ['/((?!_next|favicon.ico).*)'],
}