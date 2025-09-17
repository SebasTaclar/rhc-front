// Interfaz principal del jugador (coincide con la API real)
export interface Player {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  position: string
  jerseyNumber: number
  isActive: boolean
  teamId: number
  profilePhotoPath: string | null
  // Alias para compatibilidad con la UI existente
  photoPath?: string | null
  // Campos adicionales para la UI (opcionales para mantener compatibilidad)
  identificationNumber?: string
  epsProvider?: string
  createdAt: string
  updatedAt: string
  team?: {
    id: number
    name: string
    logoPath: string | null
  }
}

// Interfaz para crear un nuevo jugador
export interface CreatePlayerRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  position?: string // Hacer opcional para evitar errores
  jerseyNumber: number
  teamId: number
  // Campos opcionales para compatibilidad
  identificationNumber?: string
  epsProvider?: string
}

// Interfaz para actualizar un jugador
export interface UpdatePlayerRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  position?: string
  jerseyNumber?: number
  // Campos opcionales para compatibilidad
  identificationNumber?: string
  epsProvider?: string
}

// Interfaz para la respuesta de crear jugador
export interface CreatePlayerResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  position: string
  jerseyNumber: number
  isActive: boolean
  teamId: number
  profilePhotoPath: string | null
  createdAt: string
  updatedAt: string
}

// Interfaz para la respuesta de obtener jugadores
export type GetPlayersResponse = Player[]
