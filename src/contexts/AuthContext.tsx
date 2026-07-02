// src/contexts/AuthContext.tsx
'use client'

import { extrairEmailDoToken } from '@/services/lecomApi'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  userEmail: string | null
  setToken: (token: string) => void
  setUser: (user: any) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ao carregar a página, verifica se já tem token salvo
  useEffect(() => {
    const savedToken = sessionStorage.getItem('authToken')
    if (savedToken) {
      setTokenState(savedToken)

      // Tenta extrair o email do token salvo
      const email = extrairEmailDoToken(savedToken)
      if (email) {
        setUserEmail(email)
      }
    }
    setIsLoading(false)
  }, [])

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken)
    sessionStorage.setItem('authToken', newToken)

    // Extrai o email do token e salva no estado
    const email = extrairEmailDoToken(newToken)
    if (email) {
      setUserEmail(email)
    }
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
    setUser(null)
    setUserEmail(null)
    sessionStorage.removeItem('authToken')
    localStorage.removeItem('lecomUser')
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        user,
        userEmail,
        setToken,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
