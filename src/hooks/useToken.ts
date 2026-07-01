'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { message } from 'antd'

/**
 * Hook para gerenciar o token de autenticação de forma segura.
 * Fornece o token atual, verifica expiração e força logout se necessário.
 */
export function useToken() {
  const { getToken, isTokenExpired, logout } = useAuth()
  const warnedRef = useRef(false)

  const getValidToken = useCallback((): string | null => {
    const token = getToken()

    if (!token) {
      console.warn('🔑 Nenhum token encontrado')
      return null
    }

    if (isTokenExpired()) {
      if (!warnedRef.current) {
        warnedRef.current = true
        message.warning('Sua sessão expirou. Faça login novamente.')
      }
      logout()
      return null
    }

    warnedRef.current = false
    return token
  }, [getToken, isTokenExpired, logout])

  // Monitora a validade do token
  useEffect(() => {
    const check = () => getValidToken()
    const interval = setInterval(check, 30_000) // a cada 30s
    return () => clearInterval(interval)
  }, [getValidToken])

  return { getValidToken }
}
