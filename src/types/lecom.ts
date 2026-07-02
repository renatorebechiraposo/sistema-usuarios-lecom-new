export interface UsuarioLecom {
  id: number
  nome: string
  email: string
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
