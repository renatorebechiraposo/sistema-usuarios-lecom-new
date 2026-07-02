// src/app/login/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Se veio para /login com token, redireciona para / com o token
    const token = new URLSearchParams(window.location.search).get('token')
    if (token) {
      router.replace(`/?token=${encodeURIComponent(token)}`)
    } else {
      router.replace('/')
    }
  }, [router])

  return null
}
