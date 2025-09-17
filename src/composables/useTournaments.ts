import { ref, type Ref } from 'vue'
import { tournamentService } from '@/services/api/tournamentService'
import type { Tournament, CreateTournamentRequest } from '@/types/TournamentType'

export function useTournaments() {
  const tournaments: Ref<Tournament[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Cargar todos los torneos
   */
  const loadTournaments = async (): Promise<{ success: boolean; message: string }> => {
    try {
      loading.value = true
      error.value = null

      const data = await tournamentService.getTournaments()
      tournaments.value = data

      return { success: true, message: 'Torneos cargados exitosamente' }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al cargar torneos'
      error.value = errorMessage
      console.error('Error al cargar torneos:', err)
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear un nuevo torneo
   */
  const createTournament = async (
    tournamentData: CreateTournamentRequest,
  ): Promise<{ success: boolean; message: string; tournament?: Tournament }> => {
    try {
      loading.value = true
      error.value = null

      const newTournament = await tournamentService.createTournament(tournamentData)

      // Recargar la lista de torneos para obtener los datos actualizados
      await loadTournaments()

      return {
        success: true,
        message: 'Torneo creado exitosamente',
        tournament: newTournament,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear torneo'
      error.value = errorMessage
      console.error('Error al crear torneo:', err)
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar un torneo existente
   */
  const updateTournament = async (
    id: number,
    tournamentData: Partial<CreateTournamentRequest>,
  ): Promise<{ success: boolean; message: string; tournament?: Tournament }> => {
    try {
      loading.value = true
      error.value = null

      const updatedTournament = await tournamentService.updateTournament(id, tournamentData)

      // Recargar la lista de torneos
      await loadTournaments()

      return {
        success: true,
        message: 'Torneo actualizado exitosamente',
        tournament: updatedTournament,
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al actualizar torneo'
      error.value = errorMessage
      console.error('Error al actualizar torneo:', err)
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un torneo
   */
  const deleteTournament = async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      loading.value = true
      error.value = null

      const result = await tournamentService.deleteTournament(id)

      if (result.success) {
        // Recargar la lista de torneos
        await loadTournaments()
      }

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al eliminar torneo'
      error.value = errorMessage
      console.error('Error al eliminar torneo:', err)
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

  /**
   * Subir banner del torneo
   */
  const uploadTournamentBanner = async (
    tournamentId: number,
    bannerFile: File,
  ): Promise<{ success: boolean; bannerUrl?: string; message: string }> => {
    try {
      loading.value = true
      error.value = null

      const result = await tournamentService.uploadTournamentBanner(tournamentId, bannerFile)

      if (result.success) {
        // Actualizar el torneo en la lista local con la nueva bannerPath
        const tournamentIndex = tournaments.value.findIndex((t) => t.id === tournamentId)
        if (tournamentIndex !== -1) {
          tournaments.value[tournamentIndex].bannerPath = result.bannerUrl
        }
      }

      return {
        success: result.success,
        bannerUrl: result.bannerUrl,
        message: result.message,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al subir banner'
      error.value = errorMessage
      console.error('Error al subir banner del torneo:', err)
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar banner del torneo
   */
  const deleteTournamentBanner = async (
    tournamentId: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      loading.value = true
      error.value = null

      const result = await tournamentService.deleteTournamentBanner(tournamentId)

      if (result.success) {
        // Actualizar el torneo en la lista local eliminando la bannerPath
        const tournamentIndex = tournaments.value.findIndex((t) => t.id === tournamentId)
        if (tournamentIndex !== -1) {
          tournaments.value[tournamentIndex].bannerPath = null
        }
      }

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al eliminar banner'
      error.value = errorMessage
      console.error('Error al eliminar banner del torneo:', err)
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  return {
    // Estados reactivos
    tournaments,
    loading,
    error,

    // Funciones
    loadTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    uploadTournamentBanner,
    deleteTournamentBanner,
    clearError,
  }
}
