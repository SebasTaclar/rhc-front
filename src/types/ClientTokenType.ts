export interface ClientToken {
  id: number
  clientId: number
  token: string
  expiresAt: string
  isActive: boolean
  createdBy: number
  createdAt: string
  lastUsed?: string | null
  updatedAt?: string
  // Información adicional del cliente (puede venir del backend)
  client?: {
    id: number
    businessName: string
  }
  // Información del creador (puede venir del backend)
  creator?: {
    id: number
    name: string
  }
}

export interface CreateClientTokenRequest {
  clientId: number
  validityMinutes: number
}

export interface RenewClientTokenRequest {
  validityMinutes: number
}

export interface UpdateClientTokenRequest {
  isActive?: boolean
}

export interface ValidateTokenRequest {
  token: string
}

export interface ValidateTokenResponse {
  token: string
  isValid: boolean
  clientId: number
  expiresAt: string
  lastUsed?: string | null
  message: string
}
