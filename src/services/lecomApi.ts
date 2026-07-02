const API_BASE_URL = 'http://localhost:4000'

interface ApiHeaders {
  Authorization?: string
  'Content-Type': string
}

// Essa função recebe o token e retorna headers prontos
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
// USUÁRIO
// ==========================================

// Buscar usuário pelo e-mail
// GET /api/Usuario/ObterPorEmail/{email}
export async function buscarUsuarioPorEmail(token: string, email: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/Usuario/ObterPorEmail/${encodeURIComponent(email)}`,
    { headers: getHeaders(token) },
  )

  if (!response.ok) {
    throw new Error(`Erro ao buscar usuário: ${response.status}`)
  }

  return response.json()
}

// Pegar perfil do usuário logado (pelo token)
// GET /api/Usuario/ObterPorToken
export async function buscarMeuPerfil(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/Usuario/ObterPorToken`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar perfil: ${response.status}`)
  }

  return response.json()
}

// Atualizar dados do usuário
// PUT /api/Usuario/Atualizar
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

// ==========================================
// PLANTAS
// ==========================================

// Listar todas as plantas
// GET /api/Planta/ListarTodas
export async function listarPlantas(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/Planta/ListarTodas`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao listar plantas: ${response.status}`)
  }

  return response.json()
}

// Adicionar planta ao usuário
// POST /api/Planta/Adicionar/{usuarioId}
export async function adicionarPlanta(token: string, usuarioId: number, plantaId: number) {
  const response = await fetch(`${API_BASE_URL}/api/Planta/Adicionar/${usuarioId}`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ plantaId }), // ou só o ID, depende do Swagger
  })

  if (!response.ok) {
    throw new Error(`Erro ao adicionar planta: ${response.status}`)
  }

  return response.json()
}

// Remover planta do usuário
// DELETE /api/Planta/Remover/{usuarioId}/{plantaId}
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

// Listar grupos do usuário
// GET /api/Grupo/ListarPorUsuario/{usuarioId}
export async function listarGruposDoUsuario(token: string, usuarioId: number) {
  const response = await fetch(`${API_BASE_URL}/api/Grupo/ListarPorUsuario/${usuarioId}`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Erro ao listar grupos: ${response.status}`)
  }

  return response.json()
}

// Adicionar usuário a um grupo
// POST /api/Grupo/AdicionarUsuario
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
