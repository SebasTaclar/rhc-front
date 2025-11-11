import { apiClient } from './apiConfig'
import type { Client, CreateClientRequest, UpdateClientRequest } from '@/types/ClientApiType'

export const clientService = {
  // Crear cliente
  async create(data: CreateClientRequest): Promise<Client> {
    const response = await apiClient.post<Client>('/clients', data)
    return response.data
  },

  // Listar todos los clientes
  async getAll(): Promise<Client[]> {
    const response = await apiClient.get<Client[]>('/clients')
    return response.data
  },

  // Obtener cliente por ID
  async getById(id: number): Promise<Client> {
    const response = await apiClient.get<Client>(`/clients/${id}`)
    return response.data
  },

  // Actualizar cliente
  async update(id: number, data: UpdateClientRequest): Promise<Client> {
    const response = await apiClient.put<Client>(`/clients/${id}`, data)
    return response.data
  },

  // Eliminar cliente (físico)
  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/clients/${id}`)
  }
}
