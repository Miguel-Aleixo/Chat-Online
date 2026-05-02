import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const URL = process.env.NEXT_PUBLIC_URL_BACK
    const body = await req.json()

    const res = await fetch(`${URL}/auth`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    })

    if (!res.ok) {
        const errorText = await res.text()

        return NextResponse.json(
            {
                error: 'Erro na autenticação',
                details: errorText
            },
            { status: 401 }
        )
    }

    const data = await res.json()

    const response = NextResponse.json({ ok: true })

    response.cookies.set('token', data.access_token, {
        httpOnly: false,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    return response
}