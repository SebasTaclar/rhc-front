export interface Employee {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  active: boolean
  userId?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateEmployeeRequest {
  name: string
  email: string
  role: 'ADMIN' | 'EMPLOYEE'
  active: boolean
  userId?: number | null
}

export interface UpdateEmployeeRequest {
  name?: string
  email?: string
  role?: 'ADMIN' | 'EMPLOYEE'
  active?: boolean
  userId?: number | null
}
