// src/services/lecomApi.ts
const API_BASE_URL = 'http://localhost:4000'

interface ApiHeaders {
  Authorization?: string
  'Content-Type': string
}

function getHeaders(token: string | null): ApiHeaders {
  const headers: ApiHeaders = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

// ==========================================
// UTILITÁRIO - Extrair email do token JWT
// ==========================================

/**
 * Tenta extrair o email do token JWT.
 * Se o token for JWT (3 partes separadas por ponto),
 * a 2ª parte é um JSON em base64 que pode conter o email.
 *
 * Exemplo de token JWT:
 *   xxxxx.yyyyy.zzzzz
 *   A parte do meio (yyyyy) é o payload em base64
 */
export function extrairEmailDoToken(token: string): string | null {
  try {
    // Verifica se é um JWT (tem 3 partes)
    const partes = token.split('.')
    if (partes.length !== 3) {
      console.log('Token não é JWT, não foi possível extrair email')
      return null
    }

    // A 2ª parte é o payload em base64
    const payloadBase64 = partes[1]

    // Decodifica base64 para string
    // (substitui caracteres especiais do base64url)
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
    const payloadString = atob(base64)

    // Converte para objeto JSON
    const payload = JSON.parse(payloadString)

    // Tenta encontrar o email (pode estar em campos diferentes)
    const email = payload.email || payload.upn || payload.preferred_username || payload.unique_name

    if (email) {
      console.log('✅ Email extraído do token:', email)
      return email
    }

    console.log('❌ Token não contém email no payload')
    return null
  } catch (error) {
    console.error('Erro ao extrair email do token:', error)
    return null
  }
}

// ==========================================
// USUÁRIO
// ==========================================

/**
 * Buscar perfil do usuário pelo email
 * GET /lecom/user/email={email}
 *
 * O email é extraído do token automaticamente
 */
export async function buscarMeuPerfil(token: string) {
  // Primeiro, tenta extrair o email do token
  const email = extrairEmailDoToken(token)

  if (!email) {
    throw new Error('Não foi possível extrair o email do token. Verifique se o token é válido.')
  }

  console.log('🔍 Buscando perfil para o email:', email)

  const response = await fetch(`${API_BASE_URL}/lecom/user/email=${encodeURIComponent(email)}`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar perfil: ${response.status} - ${response.statusText}`)
  }

  return response.json()
}

/**
 * Buscar usuário por email (para buscar outras pessoas)
 * GET /lecom/user/email={email}
 */
export async function buscarUsuarioPorEmail(token: string, email: string) {
  const response = await fetch(`${API_BASE_URL}/lecom/user/email=${encodeURIComponent(email)}`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar usuário: ${response.status}`)
  }

  return response.json()
}

// ==========================================
// PLANTAS
// ==========================================

/**
 * Listar todas as plantas disponíveis
 * GET /api/Planta/ListarTodas
 */
export async function listarPlantas(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/Planta/ListarTodas`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao listar plantas: ${response.status}`)
  }

  return response.json()
}

/**
 * Listar plantas de um usuário específico
 * (ajuste conforme o Swagger)
 */
export async function listarPlantasDoUsuario(token: string, email: string) {
  const response = await fetch(`${API_BASE_URL}/lecom/plantas/email=${encodeURIComponent(email)}`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao listar plantas do usuário: ${response.status}`)
  }

  return response.json()
}

/**
 * Adicionar planta ao usuário
 * POST /api/Planta/Adicionar/{usuarioId}
 */
export async function adicionarPlanta(token: string, usuarioId: number, plantaId: number) {
  const response = await fetch(`${API_BASE_URL}/api/Planta/Adicionar/${usuarioId}`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ plantaId }),
  })

  if (!response.ok) {
    throw new Error(`Erro ao adicionar planta: ${response.status}`)
  }

  return response.json()
}

/**
 * Remover planta do usuário
 * DELETE /api/Planta/Remover/{usuarioId}/{plantaId}
 */
export async function removerPlanta(token: string, usuarioId: number, plantaId: number) {
  const response = await fetch(`${API_BASE_URL}/api/Planta/Remover/${usuarioId}/${plantaId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao remover planta: ${response.status}`)
  }

  return response.json()
}

// ==========================================
// GRUPOS
// ==========================================

/**
 * Listar grupos do usuário
 * GET /api/Grupo/ListarPorUsuario/{usuarioId}
 */
export async function listarGruposDoUsuario(token: string, usuarioId: number) {
  const response = await fetch(`${API_BASE_URL}/api/Grupo/ListarPorUsuario/${usuarioId}`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao listar grupos: ${response.status}`)
  }

  return response.json()
}

/**
 * Adicionar usuário a um grupo
 * POST /api/Grupo/AdicionarUsuario
 */
export async function adicionarUsuarioAoGrupo(
  token: string,
  grupoId: number,
  emailUsuario: string,
) {
  const response = await fetch(`${API_BASE_URL}/api/Grupo/AdicionarUsuario`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ grupoId, email: emailUsuario }),
  })

  if (!response.ok) {
    throw new Error(`Erro ao adicionar ao grupo: ${response.status}`)
  }

  return response.json()
}

// ==========================================
// ATUALIZAR
// ==========================================

/**
 * Atualizar dados do usuário
 * PUT /api/Usuario/Atualizar
 */
export async function atualizarUsuario(token: string, dados: any) {
  const response = await fetch(`${API_BASE_URL}/api/Usuario/Atualizar`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(dados),
  })

  if (!response.ok) {
    throw new Error(`Erro ao atualizar: ${response.status}`)
  }

  return response.json()
}
