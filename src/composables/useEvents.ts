import { ref } from 'vue'
import type { Event, PublicEvent, CreateEventRequest, UpdateEventRequest } from '@/types/EventType'
import { eventService } from '@/services/api/eventService'

const events = ref<Event[]>([])
const publicEvents = ref<PublicEvent[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useEvents() {
  // Obtener todos los eventos
  const fetchEvents = async (params?: { clientId?: number; public?: boolean }) => {
    loading.value = true
    error.value = null
    try {
      events.value = await eventService.getAll(params)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar eventos'
      console.error('Error fetching events:', err)
    } finally {
      loading.value = false
    }
  }

  // Crear evento
  const createEvent = async (data: CreateEventRequest): Promise<Event | null> => {
    loading.value = true
    error.value = null
    try {
      const newEvent = await eventService.create(data)
      await fetchEvents()
      return newEvent
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear evento'
      console.error('Error creating event:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Actualizar evento
  const updateEvent = async (id: number, data: UpdateEventRequest): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await eventService.update(id, data)
      await fetchEvents()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar evento'
      console.error('Error updating event:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Eliminar evento
  const deleteEvent = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await eventService.delete(id)
      await fetchEvents()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar evento'
      console.error('Error deleting event:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Obtener eventos públicos (sin auth)
  const fetchPublicEvents = async (clientId?: number) => {
    loading.value = true
    error.value = null
    try {
      publicEvents.value = await eventService.getPublicEvents(clientId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar eventos públicos'
      console.error('Error fetching public events:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    publicEvents,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchPublicEvents
  }
}
