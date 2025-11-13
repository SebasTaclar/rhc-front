import { apiClient } from './apiConfig'
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  ChangePasswordRequest,
  ChangeUserRoleRequest,
  ChangePasswordResponse,
  ChangeUserRoleResponse
} from '@/types/EmployeeType'

export const employeeService = {
  /**
   * Crear empleado
   * - Si no existe un usuario con el email, se crea automáticamente
   * - Usuario creado con contraseña por defecto: 1234567!
   * - Si no se especifica userRole, se asigna EMPLOYEE por defecto
   * - Se puede vincular a un usuario existente con userId
   */
  async create(data: CreateEmployeeRequest): Promise<Employee> {
    interface BackendEmployeeResponse {
      id: number
      name: string
      email: string
      role: string
      active: boolean
      userId?: number | null
      userRole?: string
      user?: { role?: string }
      createdAt?: string
      updatedAt?: string
    }
    
    console.log('🌐 Enviando request a /employees:', data)
    const response = await apiClient.post<BackendEmployeeResponse>('/employees', data)
    console.log('🌐 Respuesta completa del backend:', response)
    console.log('🌐 Data del empleado creado:', response.data)
    
    // Asegurar que userRole esté presente en la respuesta
    const employee = response.data
    const userRole = employee.userRole || employee.user?.role || data.userRole || 'EMPLOYEE'
    
    console.log(`🔍 userRole final para empleado creado: ${userRole}`)
    
    return {
      ...employee,
      userRole: userRole.toUpperCase() as 'ADMIN' | 'EMPLOYEE'
    }
  },

  // Listar todos los empleados con sus roles de usuario
  async getAll(): Promise<Employee[]> {
    interface BackendEmployee {
      id: number
      name: string
      email: string
      role: string
      active: boolean
      userId?: number | null
      createdAt?: string
      updatedAt?: string
    }
    
    // Obtener empleados
    const employeesResponse = await apiClient.get<BackendEmployee[]>('/employees')
    console.log('🔄 Empleados del backend:', employeesResponse.data)
    
    // Obtener todos los usuarios para mapear sus roles
    const usersMap: Map<number, string> = new Map()
    
    try {
      const usersResponse = await apiClient.get<Array<{ id: number; role: string }>>('/users')
      console.log('� Usuarios del backend:', usersResponse.data)
      
      // Crear mapa de userId -> role
      usersResponse.data.forEach((user: { id: number; role: string }) => {
        usersMap.set(user.id, user.role)
      })
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener usuarios:', error)
    }
    
    // Mapear empleados con sus roles de usuario
    const employees = employeesResponse.data.map((emp: BackendEmployee) => {
      let userRole: 'ADMIN' | 'EMPLOYEE' = 'EMPLOYEE'
      
      if (emp.userId && usersMap.has(emp.userId)) {
        const role = usersMap.get(emp.userId)?.toUpperCase()
        userRole = (role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE')
        console.log(`✅ Empleado ${emp.name}: userId=${emp.userId}, userRole=${userRole}`)
      } else {
        console.log(`⚠️ Empleado ${emp.name}: Sin userId o usuario no encontrado, usando EMPLOYEE`)
      }
      
      return {
        ...emp,
        userRole
      }
    })
    
    return employees
  },

  // Obtener empleado por ID
  async getById(id: number): Promise<Employee> {
    const response = await apiClient.get<Employee>(`/employees/${id}`)
    return response.data
  },

  /**
   * Actualizar empleado
   * - Se puede vincular/desvincular usuario con userId
   * - Enviar userId: null para desvincular
   */
  async update(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, data)
    return response.data
  },

  /**
   * Eliminar empleado (DELETE Físico)
   * - Si el empleado tiene usuario asociado, se elimina automáticamente
   * - Eliminación en cascada: Usuario → Empleado
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/employees/${id}`)
  },

  // Desactivar/Activar empleado
  async toggleActive(id: number, active: boolean): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, { active })
    return response.data
  },

  /**
   * Cambiar contraseña de empleado (Solo ADMIN)
   * - El empleado debe tener un usuario asociado
   * - La contraseña se valida según las reglas de seguridad
   * - Se registra en logs para auditoría
   */
  async changePassword(id: number, data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await apiClient.put<ChangePasswordResponse>(`/employees/${id}/password`, data)
    return response.data
  },

  /**
   * Cambiar rol de usuario de empleado (Solo ADMIN)
   * - El empleado debe tener un usuario asociado
   * - Valores válidos: "EMPLOYEE" o "ADMIN"
   * - Se registra en logs para auditoría
   */
  async changeUserRole(id: number, data: ChangeUserRoleRequest): Promise<ChangeUserRoleResponse> {
    const response = await apiClient.put<ChangeUserRoleResponse>(`/employees/${id}/user-role`, data)
    return response.data
  }
}
