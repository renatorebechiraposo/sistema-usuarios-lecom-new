/* eslint-disable @typescript-eslint/no-explicit-any */
import { LecomFunction, LecomGroup, LecomUser, UpdateUserPayload } from '@/types/lecom'
import axios, { AxiosInstance } from 'axios'

/**
 * Instância axios principal.
 * Todas as chamadas vão para localhost:3000 (sua API BFF).
 * O token Microsoft é enviado via interceptor.
 */
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Adiciona o token Microsoft (JWT) em TODAS as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erro 401 (token expirado/inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token Microsoft inválido ou expirado. Redirecionando para login...')
      localStorage.removeItem('token')
      localStorage.removeItem('lecomUser')
      localStorage.removeItem('tokenExpiresAt')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/**
 * Extrai dados da resposta da API Lecom.
 * A API wrapper retorna { content: [...] } para listas paginadas
 * ou objeto direto para recursos únicos.
 */
function extractData(data: any): any {
  if (!data) return null
  if (Array.isArray(data.content)) {
    return data.content
  }
  return data
}

function ensureArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data
  if (data) return [data]
  return []
}

export const lecomService = {
  // ===================== USUÁRIOS =====================

  /**
   * Busca um usuário por e-mail na API via localhost:3000.
   */
  findUserByEmail: async (email: string): Promise<LecomUser | null> => {
    try {
      const response = await api.get(`/lecom/user?email=${email}`)
      const data = extractData(response.data)

      if (Array.isArray(data)) {
        return data[0] || null
      }
      return data || null
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por e-mail:', error)
      return null
    }
  },

  /**
   * Obtém dados detalhados de um usuário pelo ID.
   */
  getUser: async (id: number): Promise<LecomUser | null> => {
    try {
      const response = await api.get(`/service/admin/api/v4/users/${id}`)
      return response.data || null
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error)
      return null
    }
  },

  /**
   * Atualiza dados do usuário via rota BFF.
   */
  updateUser: async (id: number, data: UpdateUserPayload): Promise<boolean> => {
    try {
      const response = await axios.post('/api/atualizar-usuario', {
        userId: id,
        ...data,
      })
      return response.data?.success === true
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      throw error
    }
  },

  // ===================== FUNÇÕES (PLANTAS) =====================

  /**
   * Lista todas as funções (plantas).
   */
  getFunctions: async (): Promise<LecomFunction[]> => {
    try {
      const response = await api.get('/service/admin/api/v2/functions?size=100')
      return ensureArray<LecomFunction>(extractData(response.data))
    } catch (error) {
      console.error('❌ Erro ao buscar funções:', error)
      return []
    }
  },

  /**
   * Retorna as funções (plantas) associadas a um usuário.
   */
  getUserFunctions: async (id: number): Promise<LecomFunction[]> => {
    try {
      const response = await api.get(`/service/admin/api/v3/users/${id}/functions`)
      return ensureArray<LecomFunction>(extractData(response.data))
    } catch (error) {
      console.error('❌ Erro ao buscar funções do usuário:', error)
      return []
    }
  },

  /**
   * Adiciona uma função (planta) ao usuário.
   */
  addFunctionToUser: async (functionId: number, userId: number): Promise<boolean> => {
    try {
      const response = await axios.post('/api/adicionar-planta', {
        userId,
        functionId,
      })
      return response.data?.success === true
    } catch (error) {
      console.error('❌ Erro ao adicionar função:', error)
      throw error
    }
  },

  /**
   * Remove uma função (planta) de um usuário.
   */
  removeFunctionFromUser: async (functionId: number, userId: number): Promise<boolean> => {
    try {
      const response = await axios.delete('/api/remover-planta', {
        data: { userId, functionId },
      })
      return response.data?.success === true
    } catch (error) {
      console.error('❌ Erro ao remover função:', error)
      throw error
    }
  },

  // ===================== GRUPOS =====================

  /**
   * Retorna os grupos dos quais o usuário faz parte.
   */
  getUserGroups: async (id: number): Promise<LecomGroup[]> => {
    try {
      const response = await api.get(`/service/admin/api/v3/users/${id}/groups`)
      return ensureArray<LecomGroup>(extractData(response.data))
    } catch (error) {
      console.error('❌ Erro ao buscar grupos do usuário:', error)
      return []
    }
  },

  /**
   * Retorna os grupos onde o usuário é líder.
   */
  getUserLeaderGroups: async (id: number): Promise<LecomGroup[]> => {
    try {
      const response = await api.get(`/service/admin/api/v3/groups?leaderId=${id}&size=100`)
      return ensureArray<LecomGroup>(extractData(response.data))
    } catch (error) {
      console.error('❌ Erro ao buscar grupos de liderança:', error)
      return []
    }
  },

  /**
   * Adiciona um usuário a um grupo.
   */
  addUserToGroup: async (userId: number, groupId: number): Promise<boolean> => {
    try {
      const response = await axios.post('/api/adicionar-usuario-grupo', {
        groupId,
        userId,
      })
      return response.data?.success === true
    } catch (error) {
      console.error('❌ Erro ao adicionar usuário ao grupo:', error)
      throw error
    }
  },
}
