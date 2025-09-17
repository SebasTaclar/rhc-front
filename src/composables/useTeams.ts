import { ref, computed } from 'vue'
import { teamService } from '@/services/api/teamService'
import type { Team, CreateTeamRequest, UpdateTeamRequest } from '@/types/TeamType'

// Estado global reactivo
const teams = ref<Team[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useTeams() {
  /**
   * Carga todos los equipos
   */
  const loadTeams = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await teamService.getAllTeams()

      if (response.success) {
        teams.value = response.data
        return { success: true, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar equipos'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo equipo
   */
  const createTeam = async (teamData: CreateTeamRequest) => {
    try {
      loading.value = true
      error.value = null

      const response = await teamService.createTeam(teamData)

      if (response.success) {
        // Agregar el nuevo equipo al estado local
        teams.value.push(response.data.team)
        return { success: true, message: response.message, data: response.data.team }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear equipo'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza un equipo existente
   */
  const updateTeam = async (id: number, teamData: UpdateTeamRequest) => {
    try {
      loading.value = true
      error.value = null

      const response = await teamService.updateTeam(id, teamData)

      if (response.success) {
        // Actualizar el equipo en el estado local
        const index = teams.value.findIndex((team) => team.id === id)
        if (index !== -1) {
          teams.value[index] = { ...teams.value[index], ...response.data }
        }
        return { success: true, message: response.message, data: response.data }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar equipo'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un equipo
   */
  const deleteTeam = async (id: number) => {
    try {
      loading.value = true
      error.value = null

      const response = await teamService.deleteTeam(id)

      if (response.success) {
        // Remover el equipo del estado local
        teams.value = teams.value.filter((team) => team.id !== id)
        return { success: true, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar equipo'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un equipo por ID
   */
  const getTeamById = (id: number) => {
    return computed(() => teams.value.find((team) => team.id === id))
  }

  /**
   * Obtiene equipos por torneo
   */
  const getTeamsByTournament = (tournamentId: number) => {
    return computed(() =>
      teams.value.filter((team) =>
        team.tournaments.some((tournament) => tournament.id === tournamentId),
      ),
    )
  }

  /**
   * Obtiene equipos activos
   */
  const activeTeams = computed(() => teams.value.filter((team) => team.isActive))

  /**
   * Sube el logo de un equipo
   */
  const uploadTeamLogo = async (teamId: number, file: File) => {
    try {
      loading.value = true
      error.value = null

      const response = await teamService.uploadTeamLogo(teamId, file)

      if (response.success) {
        // Actualizar el equipo en el estado local con la nueva URL del logo
        const teamIndex = teams.value.findIndex((team) => team.id === teamId)
        if (teamIndex !== -1) {
          teams.value[teamIndex] = {
            ...teams.value[teamIndex],
            logoPath: response.data.logoUrl,
          }
        }
        return { success: true, message: response.message, data: response.data }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir logo'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina el logo de un equipo
   */
  const deleteTeamLogo = async (teamId: number) => {
    try {
      loading.value = true
      error.value = null

      const response = await teamService.deleteTeamLogo(teamId)

      if (response.success) {
        // Actualizar el equipo en el estado local para remover la URL del logo
        const teamIndex = teams.value.findIndex((team) => team.id === teamId)
        if (teamIndex !== -1) {
          teams.value[teamIndex] = {
            ...teams.value[teamIndex],
            logoPath: null,
          }
        }
        return { success: true, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar logo'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpia el error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    teams: computed(() => teams.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    activeTeams,

    // Métodos
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamById,
    getTeamsByTournament,
    uploadTeamLogo,
    deleteTeamLogo,
    clearError,
  }
}
