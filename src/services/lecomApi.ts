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

/**
 * Verifica se o token JWT esta expirado
 */
export function tokenEstaExpirado(token: string): boolean {
  try {
    const partes = token.split('.')
    if (partes.length !== 3) return false

    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const payloadString = atob(base64)
    const payload = JSON.parse(payloadString)

    // JWT tem o campo 'exp' (expiration) em timestamp Unix
    if (payload.exp) {
      const dataExpiracao = new Date(payload.exp * 1000)
      const agora = new Date()
      
      console.log('Token expira em:', dataExpiracao.toLocaleString())
      console.log('Agora:', agora.toLocaleString())
      
      return dataExpiracao < agora
    }

    return false
  } catch (error) {
    console.error('Erro ao verificar expiracao:', error)
    return false
  }
}

// ==========================================
// USUARIO
// ==========================================

export async function buscarMeuPerfil(token: string) {
  // Verifica se o token ja expirou ANTES de chamar a API
  if (tokenEstaExpirado(token)) {
    throw new Error('Token expirado. Faca login novamente.')
  }

  const email = extrairEmailDoToken(token)
  if (!email) {
    throw new Error('Nao foi possivel extrair o email do token.')
  }

  const url = API_BASE_URL + '/lecom/user?email=' + encodeURIComponent(email)

  console.log('URL da requisicao:', url)

  const response = await fetch(url, {
    headers: getHeaders(token),
  })

  console.log('Status da resposta:', response.status, response.statusText)

  // Se for 401, o token expirou
  if (response.status === 401) {
    throw new Error('Token expirado ou invalido. Faca login novamente.')
  }

  if (!response.ok) {
    const errorText = await response.text().catch(function () {
      return 'Sem detalhes do erro'
    })
    console.error('Erro na resposta:', errorText)
    throw new Error('Erro ao buscar perfil: ' + response.status + ' - ' + errorText)
  }

  const data = await response.json()
  return data
}

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

export async function adicionarUsuarioAoGrupo(token: string, grupoId: number, emailUsuario: string) {
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
