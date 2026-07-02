// src/services/lecomApi.ts
const API_BASE_URL = 'http://localhost:3000'

interface ApiHeaders {
  Authorization?: string
  'Content-Type': string
}

function getHeaders(token: string | null): ApiHeaders {
  const headers: ApiHeaders = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = 'Bearer ' + token
  }

  return headers
}

// ==========================================
// UTILITARIO - Extrair email do token JWT
// ==========================================

export function extrairEmailDoToken(token: string): string | null {
  try {
    const partes = token.split('.')
    if (partes.length !== 3) {
      console.log('Token nao e JWT, nao foi possivel extrair email')
      return null
    }

    const payloadBase64 = partes[1]
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
    const payloadString = atob(base64)
    const payload = JSON.parse(payloadString)

    const email = payload.email || payload.upn || payload.preferred_username || payload.unique_name

    if (email) {
      console.log('Email extraido do token:', email)
      return email
    }

    console.log('Token nao contem email no payload')
    return null
  } catch (error) {
    console.error('Erro ao extrair email do token:', error)
    return null
  }
}

// ==========================================
// USUARIO
// ==========================================

/**
 * Buscar perfil do usuario pelo email
 * GET /lecom/user?email={email}
 */
export async function buscarMeuPerfil(token: string) {
  const email = extrairEmailDoToken(token)

  if (!email) {
    throw new Error('Nao foi possivel extrair o email do token. Verifique se o token e valido.')
  }

  const url = API_BASE_URL + '/lecom/user?email=' + encodeURIComponent(email)

  console.log('URL da requisicao:', url)

  const response = await fetch(url, {
    headers: getHeaders(token),
  })

  console.log('Status da resposta:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text().catch(function () {
      return 'Sem detalhes do erro'
    })
    console.error('Erro na resposta:', errorText)
    throw new Error('Erro ao buscar perfil: ' + response.status + ' - ' + errorText)
  }

  const data = await response.json()

  // LOG COMPLETO
  console.log('RESPOSTA COMPLETA DA API (buscarMeuPerfil)')
  console.log('JSON formatado:', JSON.stringify(data, null, 2))
  console.log('Chaves do objeto:', Object.keys(data))

  console.log('Detalhamento dos campos:')
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key]
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        console.log('  OBJETO ' + key + ':', JSON.stringify(value))
        console.log('     Chaves internas:', Object.keys(value))
      } else if (Array.isArray(value)) {
        console.log('  ARRAY ' + key + '[' + value.length + ']')
        if (value.length > 0) {
          console.log('     Primeiro item:', JSON.stringify(value[0], null, 2))
          console.log('     Chaves do item:', Object.keys(value[0]))
        }
      } else {
        console.log('  ' + key + ':', typeof value, '=', value)
      }
    }
  }

  return data
}

/**
 * Buscar usuario por email (para buscar outras pessoas)
 * GET /lecom/user?email={email}
 */
export async function buscarUsuarioPorEmail(token: string, email: string) {
  const url = API_BASE_URL + '/lecom/user?email=' + encodeURIComponent(email)

  const response = await fetch(url, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error('Erro ao buscar usuario: ' + response.status)
  }

  return response.json()
}

// ==========================================
// PLANTAS
// ==========================================

export async function listarPlantas(token: string) {
  const response = await fetch(API_BASE_URL + '/api/Planta/ListarTodas', {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error('Erro ao listar plantas: ' + response.status)
  }

  return response.json()
}

export async function listarPlantasDoUsuario(token: string, email: string) {
  const url = API_BASE_URL + '/lecom/plantas?email=' + encodeURIComponent(email)

  const response = await fetch(url, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error('Erro ao listar plantas do usuario: ' + response.status)
  }

  return response.json()
}

export async function adicionarPlanta(token: string, usuarioId: number, plantaId: number) {
  const response = await fetch(API_BASE_URL + '/api/Planta/Adicionar/' + usuarioId, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ plantaId: plantaId }),
  })

  if (!response.ok) {
    throw new Error('Erro ao adicionar planta: ' + response.status)
  }

  return response.json()
}

export async function removerPlanta(token: string, usuarioId: number, plantaId: number) {
  const response = await fetch(API_BASE_URL + '/api/Planta/Remover/' + usuarioId + '/' + plantaId, {
    method: 'DELETE',
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error('Erro ao remover planta: ' + response.status)
  }

  return response.json()
}

// ==========================================
// GRUPOS
// ==========================================

export async function listarGruposDoUsuario(token: string, usuarioId: number) {
  const response = await fetch(API_BASE_URL + '/api/Grupo/ListarPorUsuario/' + usuarioId, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error('Erro ao listar grupos: ' + response.status)
  }

  return response.json()
}

export async function adicionarUsuarioAoGrupo(
  token: string,
  grupoId: number,
  emailUsuario: string,
) {
  const response = await fetch(API_BASE_URL + '/api/Grupo/AdicionarUsuario', {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ grupoId: grupoId, email: emailUsuario }),
  })

  if (!response.ok) {
    throw new Error('Erro ao adicionar ao grupo: ' + response.status)
  }

  return response.json()
}

// ==========================================
// ATUALIZAR
// ==========================================

export async function atualizarUsuario(token: string, dados: any) {
  const response = await fetch(API_BASE_URL + '/api/Usuario/Atualizar', {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(dados),
  })

  if (!response.ok) {
    throw new Error('Erro ao atualizar: ' + response.status)
  }

  return response.json()
}
