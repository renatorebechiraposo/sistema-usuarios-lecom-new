export interface UsuarioLecom {
  id: number
  name: string
  username: string
  email: string
  language: string
  gestorImediato?: {
    id: number
    nome: string
    email: string
  }
  plantas?: Planta[]
  grupos?: Grupo[]
}

export interface Planta {
  id: number
  nome: string
  codigo?: string
}

export interface Grupo {
  id: number
  nome: string
  descricao?: string
}
