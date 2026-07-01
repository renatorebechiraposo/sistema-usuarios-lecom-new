'use client'
import { lecomService } from '@/services/lecomApi'
import { LecomUser } from '@/types/lecom'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

// Constantes
const TOKEN_EXPIRY_BUFFER = 300 // 5 minutos de margem antes de expirar
const TOKEN_REFRESH_INTERVAL = 60000 // Verificar a cada 60s
const STORAGE_KEYS = {
  USER: 'lecomUser',
  TOKEN: 'token',
  TOKEN_EXPIRES_AT: 'tokenExpiresAt',
} as const

interface AuthContextType {
  user: LecomUser | undefined
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: LecomUser) => void
  logout: () => void
  getToken: () => string | null
  isTokenExpired: () => boolean
}

function getTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('token')
}

function getEmailFromToken(token: string): string {
  const decoded = jwtDecode<{ email: string }>(token)
  return decoded.email
}

function getTokenExpiration(token: string): number {
  try {
    const decoded = jwtDecode<{ exp: number }>(token)
    return decoded.exp // Timestamp em segundos
  } catch {
    return 0
  }
}

function isTokenExpiredOrNearExpiry(token: string): boolean {
  const exp = getTokenExpiration(token)
  if (!exp) return true
  const nowInSeconds = Math.floor(Date.now() / 1000)
  return nowInSeconds >= exp - TOKEN_EXPIRY_BUFFER
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)
}

function storeSession(user: LecomUser, token: string) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  const exp = getTokenExpiration(token)
  if (exp) {
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(exp))
  }
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LecomUser | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true) // Começa como true para evitar flash de conteúdo
  const router = useRouter()
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // --- Função para renovar o token via Microsoft ---
  const redirectToMicrosoftLogin = useCallback(() => {
    const loginUrl = process.env.NEXT_PUBLIC_AUTH_LOGIN_URL
    if (loginUrl) {
      window.location.href = loginUrl
    } else {
      console.error('NEXT_PUBLIC_AUTH_LOGIN_URL não configurada')
    }
  }, [])

  // --- Logout ---
  const logout = useCallback(() => {
    setUser(undefined)
    clearSession()
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
    router.push('/login')
  }, [router])

  // --- Obter token atual ---
  const getToken = useCallback((): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN)
    } catch {
      return null
    }
  }, [])

  // --- Verificar se token expirou ---
  const isTokenExpired = useCallback((): boolean => {
    const token = getToken()
    if (!token) return true
    return isTokenExpiredOrNearExpiry(token)
  }, [getToken])

  // --- Verificador periódico de expiração ---
  useEffect(() => {
    if (!user) return

    const checkTokenExpiration = () => {
      const token = getToken()
      if (token && isTokenExpiredOrNearExpiry(token)) {
        console.warn('⚠️ Token expirou ou está próximo de expirar. Redirecionando para login.')
        clearSession()
        setUser(undefined)
        redirectToMicrosoftLogin()
      }
    }

    // Verifica imediatamente ao logar
    checkTokenExpiration()

    // Verifica periodicamente
    refreshIntervalRef.current = setInterval(checkTokenExpiration, TOKEN_REFRESH_INTERVAL)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [user, getToken, redirectToMicrosoftLogin])

  // --- Inicialização da sessão ---
  useEffect(() => {
    let isMounted = true

    async function initializeSession() {
      try {
        setIsLoading(true)
        const token = getTokenFromUrl()

        // CASO 1: Tem token na URL (vindo do Microsoft login callback)
        if (token) {
          const email = getEmailFromToken(token)
          const userData = await lecomService.findUserByEmail(email)

          if (!userData || (Array.isArray(userData) && userData.length === 0)) {
            throw new Error('Usuário não encontrado na base da Lecom')
          }

          // findUserByEmail retorna array — pegamos o primeiro
          const foundUser = Array.isArray(userData) ? userData[0] : userData

          storeSession(foundUser, token)

          // Limpa o token da URL sem recarregar a página
          if (isMounted) {
            window.history.replaceState({}, document.title, window.location.pathname)
            setUser(foundUser)
            router.push('/dashboard')
          }
          return
        }

        // CASO 2: Sem token na URL — tenta restaurar sessão
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER)

        if (storedToken && storedUser) {
          // Verifica se o token ainda é válido
          if (isTokenExpiredOrNearExpiry(storedToken)) {
            console.warn('⏰ Sessão expirada. Redirecionando para login.')
            clearSession()
            if (isMounted) {
              redirectToMicrosoftLogin()
            }
            return
          }

          if (isMounted) {
            setUser(JSON.parse(storedUser))
          }
          return
        }

        // CASO 3: Sem sessão — redireciona para login
        if (isMounted) {
          router.push('/login')
        }
      } catch (error) {
        console.error('❌ Erro na inicialização da sessão:', error)
        clearSession()
        if (isMounted) {
          router.push('/login')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeSession()

    return () => {
      isMounted = false
    }
  }, [router, redirectToMicrosoftLogin])

  // --- Login manual (fallback) ---
  const login = useCallback(
    (userData: LecomUser) => {
      setUser(userData)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
      router.push('/dashboard')
    },
    [router],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        getToken,
        isTokenExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
