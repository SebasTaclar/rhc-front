// Interfaz para el usuario asociado al equipo
export interface TeamUser {
  id: number
  email: string
  name: string
}

// Interfaz para el torneo asociado al equipo
export interface TeamTournament {
  id: number
  name: string
  startDate: string
  endDate: string
}

// Interfaz para la relación team-tournament
export interface TeamTournamentRelation {
  id: number
  teamId: number
  tournamentId: number
  joinedAt: string
  tournament: TeamTournament
}

// Interfaz principal del equipo
export interface Team {
  id: number
  name: string
  userId: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  logoPath: string | null
  user: TeamUser
  teamTournaments: TeamTournamentRelation[]
  tournaments: TeamTournament[]
}

// Interfaz para crear un nuevo equipo
export interface CreateTeamRequest {
  name: string
  logoPath: string
  userEmail: string
  userPassword: string
  userName: string
  tournamentIds: number[]
}

// Interfaz para actualizar un equipo existente
export interface UpdateTeamRequest {
  name?: string
  logoPath?: string
  tournamentIds?: number[]
}

// Interfaz para la respuesta de creación
export interface CreateTeamResponse {
  team: Team
}

// Legacy interfaces para compatibilidad (pueden ser removidas gradualmente)
export interface TeamStats {
  wins: number
  losses: number
  draws: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export interface TeamsDatabase {
  teams: Team[]
  metadata: {
    lastTeamId: number
    totalTeams: number
    lastUpdated: string
  }
}
