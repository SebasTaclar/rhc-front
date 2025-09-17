import { ApiClient, API_CONFIG } from './apiConfig'
import type {
  Tournament,
  CreateTournamentRequest,
  CreateTournamentResponse,
} from '@/types/TournamentType'

class TournamentService {
  private api = new ApiClient()

  /**
   * Obtener todos los torneos
   */
  async getTournaments(): Promise<Tournament[]> {
    try {
      const response = await this.api.get<Tournament[]>('/tournament')
      return response.data
    } catch (error) {
      console.error('Error al obtener torneos:', error)
      throw error
    }
  }

  /**
   * Crear un nuevo torneo
   */
  async createTournament(
    tournamentData: CreateTournamentRequest,
  ): Promise<CreateTournamentResponse> {
    try {
      const response = await this.api.post<CreateTournamentResponse>('/tournament', tournamentData)

      return response.data
    } catch (error) {
      console.error('Error al crear torneo:', error)
      throw error
    }
  }

  /**
   * Actualizar un torneo existente
   */
  async updateTournament(
    id: number,
    tournamentData: Partial<CreateTournamentRequest>,
  ): Promise<Tournament> {
    try {
      const response = await this.api.put<Tournament>(`/tournament/${id}`, tournamentData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar torneo:', error)
      throw error
    }
  }

  /**
   * Eliminar un torneo
   */
  async deleteTournament(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.delete<{ message: string }>(`/tournament/${id}`)
      return { success: true, message: response.message }
    } catch (error) {
      console.error('Error al eliminar torneo:', error)
      throw error
    }
  }

  /**
   * Subir banner del torneo
   */
  async uploadTournamentBanner(
    tournamentId: number,
    bannerFile: File,
  ): Promise<{ success: boolean; bannerUrl: string; message: string }> {
    try {
      const formData = new FormData()
      formData.append('bannerFile', bannerFile)

      const response = await fetch(`${API_CONFIG.baseURL}/tournaments/${tournamentId}/banner`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          // No incluir Content-Type para que el navegador lo configure automáticamente con boundary
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error al subir banner: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        bannerUrl: result.data.bannerUrl,
        message: result.data.message,
      }
    } catch (error) {
      console.error('Error al subir banner del torneo:', error)
      throw error
    }
  }

  /**
   * Eliminar banner del torneo
   */
  async deleteTournamentBanner(
    tournamentId: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/tournaments/${tournamentId}/banner`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error al eliminar banner: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        message: result.data.message,
      }
    } catch (error) {
      console.error('Error al eliminar banner del torneo:', error)
      throw error
    }
  }
}

export const tournamentService = new TournamentService()
export default tournamentService
