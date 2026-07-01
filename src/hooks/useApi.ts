'use client'
import { useAuth } from '@/contexts/AuthContext'
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useCallback, useEffect, useRef } from 'react'

interface FailedRequest {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

/**
 * Hook que retorna uma instância axios interceptada para tratar
 * automaticamente tokens expirados (401) e renovação.
 */
export function useApi(): AxiosInstance {
  const { getToken, isTokenExpired, logout } = useAuth()
  const isRefreshing = useRef(false)
  const failedQueue = useRef<FailedRequest[]>([])

  const processQueue = useCallback((error: unknown, token: string | null = null) => {
    failedQueue.current.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else if (token) {
        prom.resolve(token)
      }
    })
    failedQueue.current = []
  }, [])

  const apiRef = useRef<AxiosInstance | null>(null)

  if (!apiRef.current) {
    apiRef.current = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // --- Interceptor de Request: adiciona token ---
    apiRef.current.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // --- Interceptor de Response: trata 401 ---
    apiRef.current.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean
        }

        // Se não for 401 ou já tentou renovar, rejeita
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error)
        }

        // Se já está renovando, adiciona à fila
        if (isRefreshing.current) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.current.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return apiRef.current!.request(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing.current = true

        try {
          // Se o token expirou, faz logout
          if (isTokenExpired()) {
            logout()
            return Promise.reject(new Error('Sessão expirada'))
          }

          // Se ainda não expirou mas o servidor rejeitou, pode ser token inválido
          const token = getToken()
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
            processQueue(null, token)
            return apiRef.current!.request(originalRequest)
          }

          logout()
          return Promise.reject(new Error('Token inválido'))
        } catch (refreshError) {
          processQueue(refreshError, null)
          logout()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing.current = false
        }
      },
    )
  }

  useEffect(() => {
    return () => {
      isRefreshing.current = false
      failedQueue.current = []
    }
  }, [])

  return apiRef.current
}
