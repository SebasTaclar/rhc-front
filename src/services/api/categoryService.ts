import { apiClient, type ApiResponse } from './apiConfig'
import type {
  Category,
  CreateCategoryRequest,
  CreateCategoryResponse,
  GetCategoriesResponse,
} from '@/types/CategoryType'

class CategoryService {
  /**
   * Obtiene todas las categorías
   */
  async getCategories(): Promise<ApiResponse<GetCategoriesResponse>> {
    try {
      return await apiClient.get<GetCategoriesResponse>('/categories')
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  /**
   * Crea una nueva categoría
   */
  async createCategory(
    categoryData: CreateCategoryRequest,
  ): Promise<ApiResponse<CreateCategoryResponse>> {
    try {
      return await apiClient.post<CreateCategoryResponse>('/categories', categoryData)
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  async getCategoryById(id: number): Promise<ApiResponse<Category>> {
    try {
      return await apiClient.get<Category>(`/categories/${id}`)
    } catch (error) {
      console.error('Error fetching category by ID:', error)
      throw error
    }
  }

  /**
   * Actualiza una categoría existente
   */
  async updateCategory(
    id: number,
    categoryData: Partial<CreateCategoryRequest>,
  ): Promise<ApiResponse<Category>> {
    try {
      return await apiClient.put<Category>(`/categories/${id}`, categoryData)
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  /**
   * Elimina una categoría
   */
  async deleteCategory(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      return await apiClient.delete<{ message: string }>(`/categories/${id}`)
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }
}

// Instancia singleton del servicio de categorías
export const categoryService = new CategoryService()
