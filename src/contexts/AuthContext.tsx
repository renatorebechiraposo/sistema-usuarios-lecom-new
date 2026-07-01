'use client'
import { LecomUser } from '@/types/lecom'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { lecomService } from '@/services/lecomApi'
import { jwtDecode } from 'jwt-decode'

interface AuthContextType {
  user: LecomUser | undefined
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: LecomUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LecomUser>()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      setIsLoading(true)

      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')

      try {
        if (token) {
          router.push('/dashboard')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const decoded: any = jwtDecode(token)

          const email = decoded.email

          if (!email) throw new Error('Token inválido')

          const userData = await lecomService.findUserByEmail(email)

          if (!userData) throw new Error('Usuário não encontrado')

          setUser(userData)
          localStorage.setItem('lecomUser', JSON.stringify(userData))
          localStorage.setItem('token', token)

          window.history.replaceState({}, document.title, '/dashboard')
        } else {
          // tentar sessão existente
          const storedUser = localStorage.getItem('lecomUser')
          if (storedUser) {
            setUser(JSON.parse(storedUser))
          }
        }
      } catch (error) {
        console.error(error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    handleAuth()
  }, [])

  const login = (userData: LecomUser) => {
    setUser(userData)
    localStorage.setItem('lecomUser', JSON.stringify(userData))
    router.push('/dashboard')
  }

  const logout = () => {
    setUser(undefined)
    localStorage.removeItem('lecomUser')
    localStorage.removeItem('token')
    router.push('/login')
  }

  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
