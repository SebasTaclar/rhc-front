// Tipos para categorías
export interface Category {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  description: string
}

export interface CreateCategoryResponse {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export type GetCategoriesResponse = Array<Category>
