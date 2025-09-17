// Tipos para la API de torneos
export interface TournamentCategory {
  id: number
  tournamentId: number
  categoryId: number
  category: {
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
  }
}

export interface Tournament {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  maxTeams: number
  isActive: boolean
  bannerPath: string | null
  createdAt: string
  updatedAt: string
  tournamentCategories: TournamentCategory[]
}

export interface CreateTournamentRequest {
  name: string
  description: string
  startDate: string
  endDate: string
  maxTeams: number
  categoryIds: number[] // Array de IDs de categorías
}

export interface CreateTournamentResponse {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  maxTeams: number
  isActive: boolean
  bannerPath: string | null
  createdAt: string
  updatedAt: string
  tournamentCategories: TournamentCategory[]
}

export interface GetTournamentsResponse extends Array<Tournament> {}
