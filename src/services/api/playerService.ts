import { apiClient, type ApiResponse } from './apiConfig'
import type { Player, CreatePlayerRequest, UpdatePlayerRequest } from '@/types/PlayerType'

class PlayerService {
  /**
   * Obtiene todos los jugadores
   */
  async getAllPlayers(): Promise<ApiResponse<Player[]>> {
    return await apiClient.get<Player[]>('/players')
  }

  /**
   * Obtiene todos los jugadores de un equipo específico
   */
  async getPlayersByTeam(teamId: number): Promise<ApiResponse<Player[]>> {
    return await apiClient.get<Player[]>(`/teams/${teamId}/players`)
  }

  /**
   * Crea un nuevo jugador
   */
  async createPlayer(playerData: CreatePlayerRequest): Promise<ApiResponse<Player>> {
    return await apiClient.post<Player>('/players', playerData)
  }

  /**
   * Actualiza un jugador existente
   */
  async updatePlayer(
    playerId: number,
    playerData: UpdatePlayerRequest,
  ): Promise<ApiResponse<Player>> {
    return await apiClient.put<Player>(`/players/${playerId}`, playerData)
  }

  /**
   * Elimina un jugador
   */
  async deletePlayer(playerId: number): Promise<ApiResponse<null>> {
    return await apiClient.delete<null>(`/players/${playerId}`)
  }

  /**
   * Sube la foto de perfil de un jugador
   */
  async uploadPlayerPhoto(
    playerId: number,
    photoFile: File,
  ): Promise<ApiResponse<{ photoUrl: string }>> {
    const formData = new FormData()
    formData.append('photoFile', photoFile) // Cambiar 'photo' por 'photoFile'

    // El ApiClient ahora maneja FormData correctamente
    return await apiClient.post<{ photoUrl: string }>(`/players/${playerId}/photo`, formData)
  }

  /**
   * Elimina la foto de perfil de un jugador
   */
  async deletePlayerPhoto(playerId: number): Promise<ApiResponse<null>> {
    return await apiClient.delete<null>(`/players/${playerId}/photo`)
  }
}

// Instancia única del servicio
export const playerService = new PlayerService()
