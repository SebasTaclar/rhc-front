import { apiClient } from './apiConfig'

export interface HealthCheckResponse {
  status: string
  timestamp: string
  uptime: number
  database: {
    status: string
    responseTime: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  version: string
}

export const healthService = {
  /**
   * Verifica el estado de salud del sistema
   */
  async check(): Promise<HealthCheckResponse> {
    const response = await apiClient.get<HealthCheckResponse>('/health')
    return response.data
  },

  /**
   * Verifica si el sistema está disponible (sin autenticación)
   */
  async ping(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string }>('/health/ping')
      return response.data.status === 'ok'
    } catch {
      return false
    }
  }
}
