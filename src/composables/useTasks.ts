import { ref } from 'vue'
import { taskService } from '@/services/api/taskService'
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '@/types/TaskType'

export function useTasks() {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTasks = async (filters?: TaskFilters) => {
    loading.value = true
    error.value = null
    try {
      tasks.value = await taskService.getAll(filters)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar tareas'
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (data: CreateTaskRequest) => {
    loading.value = true
    error.value = null
    try {
      const newTask = await taskService.create(data)
      tasks.value.unshift(newTask)
      return newTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear tarea'
      console.error('Error creating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: number, data: UpdateTaskRequest) => {
    loading.value = true
    error.value = null
    try {
      const updatedTask = await taskService.update(id, data)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar tarea'
      console.error('Error updating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await taskService.delete(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar tarea'
      console.error('Error deleting task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTaskById = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      return await taskService.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar tarea'
      console.error('Error fetching task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById
  }
}
