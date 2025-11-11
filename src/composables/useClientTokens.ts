import { ref } from 'vue'
import type { ClientToken, CreateClientTokenRequest, RenewClientTokenRequest, ValidateTokenResponse } from '@/types/ClientTokenType'
import { clientTokenService } from '@/services/api/clientTokenService'

const tokens = ref<ClientToken[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const validationResult = ref<ValidateTokenResponse | null>(null)

export function useClientTokens() {
  // Obtener todos los tokens o filtrar por cliente
  const fetchTokens = async (clientId?: number) => {
    loading.value = true
    error.value = null
    try {
      tokens.value = await clientTokenService.getAll(clientId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar los tokens'
      console.error('Error fetching tokens:', err)
    } finally {
      loading.value = false
    }
  }

  // Crear nuevo token
  const createToken = async (data: CreateClientTokenRequest): Promise<ClientToken | null> => {
    loading.value = true
    error.value = null
    try {
      const newToken = await clientTokenService.create(data)
      await fetchTokens()
      return newToken
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear el token'
      console.error('Error creating token:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Renovar token
  const renewToken = async (id: number, data: RenewClientTokenRequest): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await clientTokenService.renew(id, data)
      await fetchTokens()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al renovar el token'
      console.error('Error renewing token:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Alternar estado activo/inactivo
  const toggleTokenActive = async (id: number, isActive: boolean): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await clientTokenService.toggleActive(id, isActive)
      await fetchTokens()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cambiar el estado del token'
      console.error('Error toggling token active:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Eliminar token
  const deleteToken = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await clientTokenService.delete(id)
      await fetchTokens()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar el token'
      console.error('Error deleting token:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Validar token
  const validateToken = async (token: string): Promise<ValidateTokenResponse | null> => {
    loading.value = true
    error.value = null
    validationResult.value = null
    try {
      const result = await clientTokenService.validateTokenPost({ token })
      validationResult.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al validar el token'
      console.error('Error validating token:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    tokens,
    loading,
    error,
    validationResult,
    fetchTokens,
    createToken,
    renewToken,
    toggleTokenActive,
    deleteToken,
    validateToken
  }
}
