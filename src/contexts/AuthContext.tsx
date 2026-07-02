'use client'

import { buscarMeuPerfil, extrairEmailDoToken } from '@/services/lecomApi'
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

  // Ao carregar a pagina, verifica se ja tem token salvo
  // e ja busca os dados do usuario
  useEffect(() => {
    const savedToken = sessionStorage.getItem('authToken')
    if (savedToken) {
      setTokenState(savedToken)

      const email = extrairEmailDoToken(savedToken)
      if (email) {
        setUserEmail(email)
      }

      // Busca os dados do usuario automaticamente
      buscarMeuPerfil(savedToken)
        .then(function(userData) {
          console.log('AuthContext - Dados do usuario carregados:', userData)
          console.log('AuthContext - userData e array?', Array.isArray(userData))
          // Se for array, pega o primeiro elemento
          var dadosUsuario = Array.isArray(userData) ? userData[0] : userData
          console.log('AuthContext - dadosUsuario final:', dadosUsuario)
          setUser(dadosUsuario)
        })
        .catch(function(err) {
          console.error('AuthContext - Erro ao buscar usuario:', err)
          // Se token expirou, limpa tudo
          if (err.message && err.message.includes('expirado')) {
            sessionStorage.removeItem('authToken')
            setTokenState(null)
          }
        })
        .finally(function() {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const setToken = useCallback(function(newToken: string) {
    setTokenState(newToken)
    sessionStorage.setItem('authToken', newToken)

    const email = extrairEmailDoToken(newToken)
    if (email) {
      setUserEmail(email)
    }
  }, [])

  const logout = useCallback(function() {
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
