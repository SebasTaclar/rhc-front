import { ref } from 'vue'
import { employeeService } from '@/services/api/employeeService'
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest
} from '@/types/EmployeeType'

export const useEmployees = () => {
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtener todos los empleados
  const fetchEmployees = async () => {
    loading.value = true
    error.value = null
    try {
      employees.value = await employeeService.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar empleados'
      console.error('Error fetching employees:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear nuevo empleado
   * - Si no existe usuario con el email, se crea automáticamente
   * - Contraseña por defecto: 1234567!
   * - userRole por defecto: EMPLOYEE (si no se especifica)
   */
  const createEmployee = async (data: CreateEmployeeRequest): Promise<Employee | null> => {
    loading.value = true
    error.value = null
    try {
      console.log('📤 Enviando al backend:', data)
      const newEmployee = await employeeService.create(data)
      console.log('📥 Respuesta del backend:', newEmployee)
      employees.value.push(newEmployee)
      return newEmployee
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear empleado'
      console.error('❌ Error creating employee:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Actualizar empleado
  const updateEmployee = async (id: number, data: UpdateEmployeeRequest): Promise<Employee | null> => {
    loading.value = true
    error.value = null
    try {
      const updatedEmployee = await employeeService.update(id, data)
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = updatedEmployee
      }
      return updatedEmployee
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar empleado'
      console.error('Error updating employee:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar empleado
   * - Si tiene usuario asociado, se elimina automáticamente
   * - Eliminación en cascada
   */
  const deleteEmployee = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await employeeService.delete(id)
      employees.value = employees.value.filter(emp => emp.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar empleado'
      console.error('Error deleting employee:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Cambiar estado activo/inactivo
  const toggleEmployeeActive = async (id: number, active: boolean): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      const updatedEmployee = await employeeService.toggleActive(id, active)
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = updatedEmployee
      }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cambiar estado del empleado'
      console.error('Error toggling employee active:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Obtener empleado por ID
  const getEmployeeById = async (id: number): Promise<Employee | null> => {
    loading.value = true
    error.value = null
    try {
      return await employeeService.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener empleado'
      console.error('Error getting employee:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Cambiar contraseña de empleado (Solo ADMIN)
   * - El empleado debe tener usuario asociado
   * - Se registra en logs para auditoría
   */
  const changeEmployeePassword = async (id: number, newPassword: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await employeeService.changePassword(id, { newPassword })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cambiar contraseña del empleado'
      console.error('Error changing employee password:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Cambiar rol de usuario de empleado (Solo ADMIN)
   * - El empleado debe tener usuario asociado
   * - Valores válidos: ADMIN o EMPLOYEE
   * - Se registra en logs para auditoría
   */
  const changeEmployeeUserRole = async (
    id: number,
    userRole: 'ADMIN' | 'EMPLOYEE'
  ): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      const response = await employeeService.changeUserRole(id, { userRole })
      // Actualizar el empleado en la lista local
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = {
          ...employees.value[index],
          userRole: response.newUserRole
        }
      }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cambiar rol del empleado'
      console.error('Error changing employee user role:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeActive,
    getEmployeeById,
    changeEmployeePassword,
    changeEmployeeUserRole
  }
}
