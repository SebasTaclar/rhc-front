import { ref, computed } from 'vue'
import { categoryService } from '@/services/api'
import type { Category, CreateCategoryRequest } from '@/types/CategoryType'

// Estado global de categorías
const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useCategories() {
  // Función para cargar todas las categorías
  const loadCategories = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.getCategories()

      if (response.success) {
        categories.value = response.data
        return { success: true, data: response.data }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar categorías'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Función para crear una nueva categoría
  const createCategory = async (categoryData: CreateCategoryRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.createCategory(categoryData)

      if (response.success) {
        // Agregar la nueva categoría al estado local
        categories.value.push(response.data)
        return { success: true, data: response.data, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Función para actualizar una categoría
  const updateCategory = async (id: number, categoryData: Partial<CreateCategoryRequest>) => {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.updateCategory(id, categoryData)

      if (response.success) {
        // Actualizar la categoría en el estado local
        const index = categories.value.findIndex((cat) => cat.id === id)
        if (index !== -1) {
          categories.value[index] = response.data
        }
        return { success: true, data: response.data, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Función para eliminar una categoría
  const deleteCategory = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.deleteCategory(id)

      if (response.success) {
        // Remover la categoría del estado local
        categories.value = categories.value.filter((cat) => cat.id !== id)
        return { success: true, message: response.message }
      } else {
        error.value = response.message
        return { success: false, message: response.message }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Función para obtener una categoría por ID
  const getCategoryById = (id: number): Category | undefined => {
    return categories.value.find((cat) => cat.id === id)
  }

  // Función para limpiar errores
  const clearError = () => {
    error.value = null
  }

  // Función para refrescar categorías
  const refreshCategories = async () => {
    return await loadCategories()
  }

  return {
    // Estado
    categories: computed(() => categories.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Computeds
    categoriesCount: computed(() => categories.value.length),
    hasCategories: computed(() => categories.value.length > 0),

    // Funciones
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    clearError,
    refreshCategories,
  }
}
