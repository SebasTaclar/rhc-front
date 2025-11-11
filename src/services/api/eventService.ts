import { apiClient } from './apiConfig'
import type {
  Event,
  PublicEvent,
  CreateEventRequest,
  UpdateEventRequest,
  ValidateTokenWithEventsResponse
} from '@/types/EventType'

export const eventService = {
  // Crear evento
  async create(data: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<Event>('/events', data)
    return response.data
  },

  // Obtener todos los eventos
  async getAll(params?: { clientId?: number; public?: boolean }): Promise<Event[]> {
    let url = '/events'
    const queryParams = new URLSearchParams()

    if (params?.clientId) queryParams.append('clientId', params.clientId.toString())
    if (params?.public) queryParams.append('public', 'true')

    if (queryParams.toString()) url += `?${queryParams.toString()}`

    const response = await apiClient.get<Event[]>(url)
    return response.data
  },

  // Obtener evento por ID
  async getById(id: number): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`)
    return response.data
  },

  // Actualizar evento
  async update(id: number, data: UpdateEventRequest): Promise<Event> {
    const response = await apiClient.put<Event>(`/events/${id}`, data)
    return response.data
  },

  // Eliminar evento (solo ADMIN)
  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/events/${id}`)
  },

  // === ENDPOINTS PÚBLICOS (sin autenticación) ===

  // Obtener eventos públicos (sin auth)
  async getPublicEvents(clientId?: number): Promise<PublicEvent[]> {
    const baseURL = 'https://rhc-back-bzawayehfpfdbkfp.centralus-01.azurewebsites.net/api/v1'
    let url = `${baseURL}/public/events`

    if (clientId) url += `?clientId=${clientId}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener eventos públicos')
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching public events:', error)
      throw error
    }
  },

  // Obtener evento público por ID (sin auth)
  async getPublicEventById(id: number): Promise<PublicEvent> {
    const baseURL = 'https://rhc-back-bzawayehfpfdbkfp.centralus-01.azurewebsites.net/api/v1'
    const url = `${baseURL}/public/events/${id}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener evento público')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error fetching public event:', error)
      throw error
    }
  },

  // Validar token y obtener eventos del cliente (sin auth)
  async validateTokenAndGetEvents(token: string): Promise<ValidateTokenWithEventsResponse> {
    const baseURL = 'https://rhc-back-bzawayehfpfdbkfp.centralus-01.azurewebsites.net/api/v1'
    const url = `${baseURL}/public/validate-token?token=${encodeURIComponent(token)}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al validar token')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error validating token and fetching events:', error)
      throw error
    }
  }
}
