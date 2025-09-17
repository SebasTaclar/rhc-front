import { ref, type Ref } from 'vue'
import { playerService } from '@/services/api/playerService'
import type { Player, CreatePlayerRequest, UpdatePlayerRequest } from '@/types/PlayerType'

export function usePlayers() {
  const players: Ref<Player[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Cargar jugadores de un equipo
   */
  const loadPlayersByTeam = async (
    teamId: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      loading.value = true
      error.value = null
      const response = await playerService.getPlayersByTeam(teamId)

      players.value = response.data

      return { success: true, message: 'Jugadores cargados exitosamente' }
    } catch (err) {
      console.error('Error en loadPlayersByTeam:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al cargar jugadores'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear un nuevo jugador
   */
  const createPlayer = async (
    playerData: CreatePlayerRequest,
  ): Promise<{ success: boolean; message: string; data?: Player }> => {
    try {
      loading.value = true
      error.value = null

      const response = await playerService.createPlayer(playerData)

      // Agregar el nuevo jugador a la lista local
      players.value.push(response.data)

      return {
        success: true,
        message: 'Jugador creado exitosamente',
        data: response.data,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear jugador'
      error.value = errorMessage
      console.error('Error al crear jugador:', err)
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar un jugador existente
   */
  const updatePlayer = async (
    playerId: number,
    playerData: UpdatePlayerRequest,
  ): Promise<{ success: boolean; message: string; data?: Player }> => {
    try {
      loading.value = true
      error.value = null

      const response = await playerService.updatePlayer(playerId, playerData)

      // Actualizar el jugador en la lista local
      const playerIndex = players.value.findIndex((p) => p.id === playerId)
      if (playerIndex !== -1) {
        players.value[playerIndex] = response.data
      }

      return {
        success: true,
        message: 'Jugador actualizado exitosamente',
        data: response.data,
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al actualizar jugador'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un jugador
   */
  const deletePlayer = async (playerId: number): Promise<{ success: boolean; message: string }> => {
    try {
      loading.value = true
      error.value = null

      await playerService.deletePlayer(playerId)

      // Remover el jugador de la lista local
      players.value = players.value.filter((p) => p.id !== playerId)

      return { success: true, message: 'Jugador eliminado exitosamente' }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al eliminar jugador'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Subir foto del jugador
   */
  const uploadPlayerPhoto = async (
    playerId: number,
    photoFile: File,
  ): Promise<{ success: boolean; photoUrl?: string; message: string }> => {
    try {
      loading.value = true
      error.value = null

      const response = await playerService.uploadPlayerPhoto(playerId, photoFile)

      // Actualizar el jugador en la lista local con la nueva photoPath
      const playerIndex = players.value.findIndex((p) => p.id === playerId)
      if (playerIndex !== -1) {
        players.value[playerIndex].profilePhotoPath = response.data.photoUrl
      }

      return {
        success: true,
        photoUrl: response.data.photoUrl,
        message: 'Foto subida exitosamente',
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al subir foto'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar foto del jugador
   */
  const deletePlayerPhoto = async (
    playerId: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      loading.value = true
      error.value = null

      await playerService.deletePlayerPhoto(playerId)

      // Actualizar el jugador en la lista local eliminando la photoPath
      const playerIndex = players.value.findIndex((p) => p.id === playerId)
      if (playerIndex !== -1) {
        players.value[playerIndex].profilePhotoPath = null
      }

      return { success: true, message: 'Foto eliminada exitosamente' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al eliminar foto'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpiar errores
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // Estados reactivos
    players,
    loading,
    error,

    // Funciones
    loadPlayersByTeam,
    createPlayer,
    updatePlayer,
    deletePlayer,
    uploadPlayerPhoto,
    deletePlayerPhoto,
    clearError,
  }
}
