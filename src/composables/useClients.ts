import { ref } from 'vue'
import { clientService } from '@/services/api/clientService'
import type { Client, CreateClientRequest, UpdateClientRequest } from '@/types/ClientApiType'

export const useClients = () => {
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtener todos los clientes
  const fetchClients = async () => {
    loading.value = true
    error.value = null
    try {
      clients.value = await clientService.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar clientes'
      console.error('Error fetching clients:', err)
    } finally {
      loading.value = false
    }
  }

  // Crear nuevo cliente
  const createClient = async (data: CreateClientRequest): Promise<Client | null> => {
    loading.value = true
    error.value = null
    try {
      const newClient = await clientService.create(data)
      clients.value.push(newClient)
      return newClient
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear cliente'
      console.error('Error creating client:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Actualizar cliente
  const updateClient = async (id: number, data: UpdateClientRequest): Promise<Client | null> => {
    loading.value = true
    error.value = null
    try {
      const updatedClient = await clientService.update(id, data)
      const index = clients.value.findIndex(client => client.id === id)
      if (index !== -1) {
        clients.value[index] = updatedClient
      }
      return updatedClient
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar cliente'
      console.error('Error updating client:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Eliminar cliente
  const deleteClient = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await clientService.delete(id)
      clients.value = clients.value.filter(client => client.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar cliente'
      console.error('Error deleting client:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Obtener cliente por ID
  const getClientById = async (id: number): Promise<Client | null> => {
    loading.value = true
    error.value = null
    try {
      return await clientService.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener cliente'
      console.error('Error getting client:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClientById
  }
}
