/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const extractData = (data: any) => {
  if (data && Array.isArray(data.content)) {
    return data.content
  } else {
    return [data]
  }
}

export const lecomService = {
  findUserByEmail: async (email: string) => {
    try {
      const response = await api.get(`/lecom/user?email=${email}`)

      return extractData(response.data)
    } catch (error) {
      console.error('Erro ao buscar por e-mail:', error)
      return []
    }
  },

  // 2. Obter dados do usuário
  getUser: async (id: number) => {
    try {
      const response = await api.get(`/service/admin/api/v4/users/${id}`)
      return response.data
    } catch (error) {
      console.error(error)
    }
  },

  //   // 3. Atualizar dados do usuário
  //   updateUser: async (id: number, data: any) => {
  //     return axios.post('/api/atualizar-usuario', {
  //       userId: id,
  //       idLeader: data.idLeader,
  //       email: data.email,
  //       name: data.name,
  //       idDepartment: data.idDepartment,
  //       language: data.language,
  //       searchAccess: data.searchAccess,
  //     })
  //   },

  //   // 4. Listar todas as funções
  //   getFunctions: async () => {
  //     const response = await api.get(`/service/admin/api/v2/functions?size=100`)
  //     return extractData(response.data)
  //   },

  // 5. Ver funções que o usuário já possui
  getUserFunctions: async (id: number) => {
    try {
      const response = await api.get(`/service/admin/api/v3/users/${id}/functions`)
      return extractData(response.data)
    } catch (error) {
      console.error(error)
    }
  },

  // 6. Verifica os grupos do usuário
  getUserGroups: async (id: number) => {
    try {
      const response = await api.get(`/service/admin/api/v3/users/${id}/groups`)
      return extractData(response.data)
    } catch (error) {
      console.error(error)
      return false
    }
  },
}

//   // 7. Verificar se é Lider de algum grupo
//   getUserLeaderGroups: async (id: number) => {
//     try {
//       const response = await api.get(`/service/admin/api/v3/groups?leaderId=${id}&size=100`)
//       return extractData(response.data)
//     } catch (error) {
//       console.error(error)
//       return false
//     }
//   },

//   // 8. Associar função ao usuário
//   addFunctionToUser: async (functionId: number, userId: number) => {
//     return axios.post('/api/adicionar-planta', {
//       userId: userId,
//       functionId: functionId,
//     })
//   },
//   // 9. Remove função do usuário
//   removeFunctionFromUser: async (functionId: number, userId: number) => {
//     return axios.delete('/api/remover-planta', {
//       data: { userId, functionId },
//     })
//   },

//   // 10. Adiciona usuário ao grupo
//   addUserToGroup: async (userId: number, groupId: number) => {
//     return axios.post('/api/adicionar-usuario-grupo', {
//       groupId: groupId,
//       userId: userId,
//     })
//   },
// }
