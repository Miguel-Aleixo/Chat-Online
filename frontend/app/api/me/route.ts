import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {

  // PEGA O TOKEN
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  // MANDA PARA O BACKEND VERIFICAR O TOKEN E DEVOLVER DECODIFICADO
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL_BACK}/auth/me`, {
    headers: {
      Cookie: `token=${token}`
    }
  });

  if (!res.ok) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  // INFORMAÇÕES DO USUÁRIO
  const data = await res.json()

  return NextResponse.json(data)
}