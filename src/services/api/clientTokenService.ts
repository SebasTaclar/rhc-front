import { apiClient } from './apiConfig'
import type {
  ClientToken,
  CreateClientTokenRequest,
  RenewClientTokenRequest,
  UpdateClientTokenRequest,
  ValidateTokenRequest,
  ValidateTokenResponse
} from '@/types/ClientTokenType'

export const clientTokenService = {
  // Crear token de cliente
  async create(data: CreateClientTokenRequest): Promise<ClientToken> {
    const response = await apiClient.post<ClientToken>('/clienttokens', data)
    return response.data
  },

  // Listar todos los tokens (solo ADMIN)
  async getAll(clientId?: number): Promise<ClientToken[]> {
    const url = clientId ? `/clienttokens?clientId=${clientId}` : '/clienttokens'
    const response = await apiClient.get<ClientToken[]>(url)
    return response.data
  },

  // Obtener token por ID
  async getById(id: number): Promise<ClientToken> {
    const response = await apiClient.get<ClientToken>(`/clienttokens/${id}`)
    return response.data
  },

  // Renovar token
  async renew(id: number, data: RenewClientTokenRequest): Promise<ClientToken> {
    const response = await apiClient.put<ClientToken>(`/clienttokens/${id}/renew`, data)
    return response.data
  },

  // Actualizar token (cambiar estado)
  async update(id: number, data: UpdateClientTokenRequest): Promise<ClientToken> {
    const response = await apiClient.put<ClientToken>(`/clienttokens/${id}`, data)
    return response.data
  },

  // Validar token (GET)
  async validateTokenGet(token: string): Promise<ValidateTokenResponse> {
    const response = await apiClient.get<ValidateTokenResponse>(
      `/clienttokens/validate?token=${encodeURIComponent(token)}`
    )
    return response.data
  },

  // Validar token (POST)
  async validateTokenPost(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    const response = await apiClient.post<ValidateTokenResponse>('/clienttokens/validate', data)
    return response.data
  },

  // Validar token sin autenticación (público)
  async validateTokenPublic(token: string): Promise<ValidateTokenResponse> {
    const baseURL = 'https://rhc-back-bzawayehfpfdbkfp.centralus-01.azurewebsites.net/api/v1'
    const url = `${baseURL}/clienttokens/validate?token=${encodeURIComponent(token)}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al validar el token')
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error('Error validating token:', error)
      throw error
    }
  },

  // Eliminar token (físico)
  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/clienttokens/${id}`)
  },

  // Desactivar/Activar token
  async toggleActive(id: number, isActive: boolean): Promise<ClientToken> {
    const response = await apiClient.put<ClientToken>(`/clienttokens/${id}`, { isActive })
    return response.data
  }
}
