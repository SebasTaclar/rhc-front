import { apiClient } from './apiConfig'
import type { ApiResponse } from './apiConfig'

// Tipos para el servicio de wallpapers
export interface WallpaperStatusData {
  approved: number[]
  pending: number[]
  summary: {
    approvedCount: number
    pendingCount: number
    totalUnavailable: number
  }
}

export interface WallpaperStatusResponse {
  success: boolean
  message: string
  data: WallpaperStatusData
  timestamp: string
  statusCode: number
}

class WallpaperService {
  /**
   * Obtener el estado de todos los wallpapers
   */
  async getWallpaperStatus(): Promise<ApiResponse<WallpaperStatusData>> {
    try {
      const response = await apiClient.get<WallpaperStatusData>('/wallpapers/status')
      return response
    } catch (error) {
      console.error('Error getting wallpaper status:', error)
      throw error
    }
  }

  /**
   * Obtener números de wallpapers no disponibles (aprobados + pendientes)
   */
  async getUnavailableNumbers(): Promise<number[]> {
    try {
      const response = await this.getWallpaperStatus()
      if (response.success && response.data) {
        return [...response.data.approved, ...response.data.pending]
      }
      return []
    } catch (error) {
      console.error('Error getting unavailable numbers:', error)
      return []
    }
  }

  /**
   * Verificar si un número específico está disponible
   */
  async isNumberAvailable(number: number): Promise<boolean> {
    try {
      const unavailableNumbers = await this.getUnavailableNumbers()
      return !unavailableNumbers.includes(number)
    } catch (error) {
      console.error('Error checking number availability:', error)
      return true // En caso de error, asumimos que está disponible
    }
  }

  /**
   * Obtener números disponibles en un rango
   */
  async getAvailableNumbersInRange(start: number, end: number): Promise<number[]> {
    try {
      const unavailableNumbers = await this.getUnavailableNumbers()
      const availableNumbers: number[] = []

      for (let i = start; i <= end; i++) {
        if (!unavailableNumbers.includes(i)) {
          availableNumbers.push(i)
        }
      }

      return availableNumbers
    } catch (error) {
      console.error('Error getting available numbers in range:', error)
      return []
    }
  }
}

export const wallpaperService = new WallpaperService()
