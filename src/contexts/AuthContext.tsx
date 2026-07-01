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

const getTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)

  return urlParams.get('token')
}

const getEmailFromToken = (token: string) => {
  const decoded = jwtDecode<{
    email: string
  }>(token)

  return decoded.email
}

const getUserByEmail = async (email: string) => {
  return lecomService.findUserByEmail(email)
}

const storeSession = (user: LecomUser, token: string) => {
  localStorage.setItem('lecomUser', JSON.stringify(user))

  localStorage.setItem('token', token)
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LecomUser>()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function initializeSession() {
      try {
        setIsLoading(true)

        const token = getTokenFromUrl()

        if (!token) {
          const storedUser = localStorage.getItem('lecomUser')

          if (storedUser) {
            setUser(JSON.parse(storedUser))
          }

          return
        }

        const email = getEmailFromToken(token)

        const user = await getUserByEmail(email)

        if (!user) {
          throw new Error('Usuário não encontrado')
        }

        storeSession(user, token)

        setUser(user)
        router.push('/dashboard')
      } catch (error) {
        console.error(error)

        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
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
