import { NextResponse } from 'next/server'

export async function POST(req: Request) {

    // URL DO BACKEND
    const URL = process.env.NEXT_PUBLIC_URL_BACK

    // BODY
    const body = await req.json()

    const res = await fetch(`${URL}/auth`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    })

    if (!res.ok) {
        const dataError = await res.json()
        
        return NextResponse.json(
            {
                error: dataError.error,
                message: dataError.message
            },
            { status: dataError.statusCode }
        )
    }

    const data = await res.json()

    const response = NextResponse.json({ ok: true })

    // SALVA TOKEN
    response.cookies.set('token', data.access_token, {
        httpOnly: false,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    return response
}