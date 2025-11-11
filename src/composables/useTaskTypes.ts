import { ref } from 'vue'
import { taskTypeService } from '@/services/api/taskTypeService'
import type { TaskType, CreateTaskTypeRequest, UpdateTaskTypeRequest } from '@/types/TaskTypeApi'

export const useTaskTypes = () => {
  const taskTypes = ref<TaskType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtener todos los tipos de tarea
  const fetchTaskTypes = async () => {
    loading.value = true
    error.value = null
    try {
      taskTypes.value = await taskTypeService.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar tipos de tarea'
      console.error('Error fetching task types:', err)
    } finally {
      loading.value = false
    }
  }

  // Crear nuevo tipo de tarea
  const createTaskType = async (data: CreateTaskTypeRequest): Promise<TaskType | null> => {
    loading.value = true
    error.value = null
    try {
      const newTaskType = await taskTypeService.create(data)
      taskTypes.value.push(newTaskType)
      return newTaskType
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear tipo de tarea'
      console.error('Error creating task type:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Actualizar tipo de tarea
  const updateTaskType = async (
    id: number,
    data: UpdateTaskTypeRequest
  ): Promise<TaskType | null> => {
    loading.value = true
    error.value = null
    try {
      const updatedTaskType = await taskTypeService.update(id, data)
      const index = taskTypes.value.findIndex((tt) => tt.id === id)
      if (index !== -1) {
        taskTypes.value[index] = updatedTaskType
      }
      return updatedTaskType
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar tipo de tarea'
      console.error('Error updating task type:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Eliminar tipo de tarea
  const deleteTaskType = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await taskTypeService.delete(id)
      taskTypes.value = taskTypes.value.filter((tt) => tt.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar tipo de tarea'
      console.error('Error deleting task type:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Cambiar estado activo/inactivo
  const toggleTaskTypeActive = async (id: number, active: boolean): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      const updatedTaskType = await taskTypeService.toggleActive(id, active)
      const index = taskTypes.value.findIndex((tt) => tt.id === id)
      if (index !== -1) {
        taskTypes.value[index] = updatedTaskType
      }
      return true
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Error al cambiar estado del tipo de tarea'
      console.error('Error toggling task type active:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Obtener tipo de tarea por ID
  const getTaskTypeById = async (id: number): Promise<TaskType | null> => {
    loading.value = true
    error.value = null
    try {
      return await taskTypeService.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener tipo de tarea'
      console.error('Error getting task type:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    taskTypes,
    loading,
    error,
    fetchTaskTypes,
    createTaskType,
    updateTaskType,
    deleteTaskType,
    toggleTaskTypeActive,
    getTaskTypeById
  }
}
