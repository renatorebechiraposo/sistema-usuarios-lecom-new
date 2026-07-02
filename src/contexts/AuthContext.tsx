'use client'

import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  setToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ao carregar a página, verifica se já tem token salvo
  // useEffect(() => {
  //   const savedToken = sessionStorage.getItem('authToken') // OU localStorage
  //   if (savedToken) {
  //     setTokenState(savedToken)
  //     // Opcional: já buscar dados do usuário
  //     buscarMeuPerfil(savedToken)
  //       .then(setUser)
  //       .catch(() => logout()) // Se token expirou, desloga
  //   }
  //   setIsLoading(false)
  // }, [])

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken)
    sessionStorage.setItem('authToken', newToken) // Salva para não perder ao recarregar
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
    setUser(null)
    sessionStorage.removeItem('authToken')
    localStorage.removeItem('lecomUser')
    // Redirecionar para login
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        user,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
