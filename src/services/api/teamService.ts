import { apiClient, API_CONFIG } from './apiConfig'
import type { Team, CreateTeamRequest, UpdateTeamRequest } from '@/types/TeamType'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
  statusCode: number
}

export class TeamService {
  /**
   * Obtiene todos los equipos
   */
  async getAllTeams(): Promise<ApiResponse<Team[]>> {
    try {
      const response = await apiClient.get<Team[]>('/teams')
      return response
    } catch (error) {
      console.error('Error fetching teams:', error)
      throw error
    }
  }

  /**
   * Crea un nuevo equipo
   */
  async createTeam(teamData: CreateTeamRequest): Promise<ApiResponse<{ team: Team }>> {
    try {
      const response = await apiClient.post<{ team: Team }>('/teams', teamData)
      return response
    } catch (error) {
      console.error('Error creating team:', error)
      throw error
    }
  }

  /**
   * Actualiza un equipo existente
   */
  async updateTeam(id: number, teamData: UpdateTeamRequest): Promise<ApiResponse<Team>> {
    try {
      const response = await apiClient.put<Team>(`/teams/${id}`, teamData)
      return response
    } catch (error) {
      console.error('Error updating team:', error)
      throw error
    }
  }

  /**
   * Elimina un equipo
   */
  async deleteTeam(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete<null>(`/teams/${id}`)
      return response
    } catch (error) {
      console.error('Error deleting team:', error)
      throw error
    }
  }

  /**
   * Sube el logo de un equipo
   */
  async uploadTeamLogo(teamId: number, file: File): Promise<ApiResponse<{ logoUrl: string }>> {
    try {
      // Crear FormData con el archivo
      const formData = new FormData()
      formData.append('logoFile', file)

      const response = await fetch(`${API_CONFIG.baseURL}/teams/${teamId}/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Incluir token de autenticación
          // No incluir Content-Type para que el navegador lo configure automáticamente con boundary
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error uploading logo')
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading team logo:', error)
      throw error
    }
  }

  /**
   * Elimina el logo de un equipo
   */
  async deleteTeamLogo(teamId: number): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/teams/${teamId}/logo`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Incluir token de autenticación
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error deleting logo')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting team logo:', error)
      throw error
    }
  }
}

// Instancia única del servicio
export const teamService = new TeamService()
