import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })

  // REMOVE O TOKEN
  res.cookies.delete('token')

  return res
}