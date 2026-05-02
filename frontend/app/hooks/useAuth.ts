'use client'

import { useEffect, useState } from 'react'

type User = {
  id: number
  email: string
  name: string,
  role: string
}

// BUSCA INFORMAÇÕES DO USUARIO
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
        )
        const data = await res.json()

        setUser(data || null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { user, loading, isLogged: !!user }
}