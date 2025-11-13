<template>
  <div class="employee-management">
    <div class="header">
      <h2>Gestión de Empleados</h2>
      <button
        v-if="canManageEmployees"
        @click="openCreateModal"
        class="btn btn-primary"
      >
        <span class="icon">+</span>
        Nuevo Empleado
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando empleados...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- Tabla de empleados -->
    <div v-if="!loading && employees.length > 0" class="table-container">
      <table class="employees-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol Organizacional</th>
            <th>Rol Sistema</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id" :class="{ inactive: !employee.active }">
            <td>{{ employee.name }}</td>
            <td>{{ employee.email }}</td>
            <td>
              <span class="badge role-badge">
                {{ employee.role }}
              </span>
            </td>
            <td>
              <span
                class="badge"
                :class="employee.userRole?.toUpperCase() === 'ADMIN' ? 'admin' : 'employee'"
              >
                {{ employee.userRole?.toUpperCase() === 'ADMIN' ? 'Administrador' : 'Empleado' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="employee.active ? 'active' : 'inactive'">
                {{ employee.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="actions">
              <button
                v-if="canManageEmployees"
                @click="openEditModal(employee)"
                class="btn-icon"
                title="Editar"
              >
                ✏️
              </button>
              <button
                v-if="canManageEmployees && employee.userId"
                @click="openChangePasswordModal(employee)"
                class="btn-icon"
                title="Cambiar Contraseña"
              >
                🔑
              </button>
              <button
                v-if="canManageEmployees && employee.userId"
                @click="openChangeUserRoleModal(employee)"
                class="btn-icon"
                title="Cambiar Rol Sistema"
              >
                👤
              </button>
              <button
                v-if="canManageEmployees"
                @click="toggleActive(employee)"
                class="btn-icon"
                :title="employee.active ? 'Desactivar' : 'Activar'"
              >
                {{ employee.active ? '🔒' : '🔓' }}
              </button>
              <button
                v-if="canManageEmployees"
                @click="confirmDelete(employee)"
                class="btn-icon delete"
                title="Eliminar"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sin empleados -->
    <div v-if="!loading && employees.length === 0" class="empty-state">
      <p>No hay empleados registrados</p>
      <button @click="openCreateModal" class="btn btn-primary">Crear Primer Empleado</button>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Empleado' : 'Nuevo Empleado' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label>Nombre *</label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              required
              placeholder="Nombre completo"
            />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input
              v-model="formData.email"
              type="email"
              class="form-input"
              required
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div class="form-group">
            <label>Rol Organizacional *</label>
            <input
              v-model="formData.role"
              type="text"
              class="form-input"
              required
              placeholder="Ej: RECURSOS HUMANOS, CONTABILIDAD, GERENCIA GENERAL"
            />
            <small class="form-hint">Departamento o función del empleado</small>
          </div>

          <div class="form-group" v-if="!isEditMode">
            <label>Rol de Sistema</label>
            <select v-model="formData.userRole" class="form-select">
              <option value="EMPLOYEE">Empleado</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <small class="form-hint">Permisos de acceso al sistema (por defecto: Empleado)</small>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input v-model="formData.active" type="checkbox" />
              <span>Activo</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ isEditMode ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <p>¿Está seguro de eliminar al empleado <strong>{{ employeeToDelete?.name }}</strong>?</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="showConfirmModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="handleDelete" class="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Cambiar Contraseña</h3>
          <button @click="closePasswordModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="handleChangePassword" class="modal-body">
          <p class="info-text">Empleado: <strong>{{ selectedEmployee?.name }}</strong></p>
          <div class="form-group">
            <label>Nueva Contraseña *</label>
            <input
              v-model="newPassword"
              type="password"
              class="form-input"
              required
              minlength="8"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div class="form-group">
            <label>Confirmar Contraseña *</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-input"
              required
              placeholder="Confirmar contraseña"
            />
          </div>
          <div class="modal-footer">
            <button type="button" @click="closePasswordModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Cambiar Rol Sistema -->
    <div v-if="showUserRoleModal" class="modal-overlay" @click="closeUserRoleModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Cambiar Rol de Sistema</h3>
          <button @click="closeUserRoleModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="handleChangeUserRole" class="modal-body">
          <p class="info-text">Empleado: <strong>{{ selectedEmployee?.name }}</strong></p>
          <p class="info-text">Rol actual: <strong>{{ selectedEmployee?.userRole === 'ADMIN' ? 'Administrador' : 'Empleado' }}</strong></p>
          <div class="form-group">
            <label>Nuevo Rol de Sistema *</label>
            <select v-model="newUserRole" class="form-select" required>
              <option value="EMPLOYEE">Empleado</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <small class="form-hint">Define los permisos de acceso al sistema</small>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeUserRoleModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              Cambiar Rol
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEmployees } from '@/composables/useEmployees'
import { useAuth } from '@/composables/useAuth'
import type { Employee } from '@/types/EmployeeType'

const {
  employees,
  loading,
  error,
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeActive,
  changeEmployeePassword,
  changeEmployeeUserRole
} = useEmployees()

const { canManageEmployees } = useAuth()

const showModal = ref(false)
const showConfirmModal = ref(false)
const showPasswordModal = ref(false)
const showUserRoleModal = ref(false)
const isEditMode = ref(false)
const employeeToDelete = ref<Employee | null>(null)
const selectedEmployee = ref<Employee | null>(null)
const newPassword = ref('')
const confirmPassword = ref('')
const newUserRole = ref<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE')

const formData = ref({
  name: '',
  email: '',
  role: '', // Rol organizacional (string libre)
  userRole: 'EMPLOYEE' as 'ADMIN' | 'EMPLOYEE', // Rol de sistema
  active: true,
  userId: undefined as number | undefined
})

const currentEmployeeId = ref<number | null>(null)

// Cargar empleados al montar
onMounted(() => {
  fetchEmployees()
})

// Abrir modal de creación
const openCreateModal = () => {
  isEditMode.value = false
  formData.value = {
    name: '',
    email: '',
    role: '',
    userRole: 'EMPLOYEE',
    active: true,
    userId: undefined
  }
  showModal.value = true
}

// Abrir modal de edición
const openEditModal = (employee: Employee) => {
  isEditMode.value = true
  currentEmployeeId.value = employee.id
  formData.value = {
    name: employee.name,
    email: employee.email,
    role: employee.role,
    userRole: employee.userRole || 'EMPLOYEE',
    active: employee.active,
    userId: employee.userId || undefined
  }
  showModal.value = true
}

// Cerrar modal
const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  currentEmployeeId.value = null
}

// Manejar envío del formulario
const handleSubmit = async () => {
  if (isEditMode.value && currentEmployeeId.value) {
    // Al editar, no se envía userRole (se cambia con endpoint específico)
    const data = {
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
      active: formData.value.active,
      userId: formData.value.userId || null
    }
    await updateEmployee(currentEmployeeId.value, data)
  } else {
    // Al crear, se incluye userRole
    const data = {
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
      active: formData.value.active,
      userId: formData.value.userId || null,
      userRole: formData.value.userRole
    }
    console.log('🔍 Creando empleado con datos:', data)
    const result = await createEmployee(data)
    console.log('✅ Empleado creado:', result)

    // Recargar la lista completa para obtener datos actualizados del backend
    if (!error.value && result) {
      await fetchEmployees()
    }
  }

  if (!error.value) {
    closeModal()
  }
}

// Alternar estado activo
const toggleActive = async (employee: Employee) => {
  await toggleEmployeeActive(employee.id, !employee.active)
}

// Confirmar eliminación
const confirmDelete = (employee: Employee) => {
  employeeToDelete.value = employee
  showConfirmModal.value = true
}

// Eliminar empleado
const handleDelete = async () => {
  if (employeeToDelete.value) {
    await deleteEmployee(employeeToDelete.value.id)
    showConfirmModal.value = false
    employeeToDelete.value = null
  }
}

// Abrir modal cambiar contraseña
const openChangePasswordModal = (employee: Employee) => {
  selectedEmployee.value = employee
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordModal.value = true
}

// Cerrar modal contraseña
const closePasswordModal = () => {
  showPasswordModal.value = false
  selectedEmployee.value = null
  newPassword.value = ''
  confirmPassword.value = ''
}

// Cambiar contraseña
const handleChangePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('Las contraseñas no coinciden')
    return
  }

  if (selectedEmployee.value) {
    const success = await changeEmployeePassword(selectedEmployee.value.id, newPassword.value)
    if (success) {
      alert('Contraseña cambiada exitosamente')
      closePasswordModal()
    }
  }
}

// Abrir modal cambiar userRole
const openChangeUserRoleModal = (employee: Employee) => {
  selectedEmployee.value = employee
  newUserRole.value = employee.userRole || 'EMPLOYEE'
  showUserRoleModal.value = true
}

// Cerrar modal userRole
const closeUserRoleModal = () => {
  showUserRoleModal.value = false
  selectedEmployee.value = null
}

// Cambiar userRole
const handleChangeUserRole = async () => {
  if (selectedEmployee.value) {
    const success = await changeEmployeeUserRole(selectedEmployee.value.id, newUserRole.value)
    if (success) {
      alert('Rol de sistema cambiado exitosamente')
      closeUserRoleModal()
      await fetchEmployees() // Recargar lista para reflejar cambios
    }
  }
}
</script>

<style scoped>
.employee-management {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background: #fef2f2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.table-container {
  overflow-x: auto;
}

.employees-table {
  width: 100%;
  border-collapse: collapse;
}

.employees-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.employees-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 700;
  color: #334155;
  font-size: 0.9375rem;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.employees-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
  font-weight: 600;
  font-size: 0.9375rem;
}

.employees-table tbody tr:hover {
  background: #f8fafc;
}

.employees-table tbody tr.inactive {
  opacity: 0.6;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge.role-badge {
  background: #e0f2fe;
  color: #075985;
  text-transform: none;
  font-size: 0.75rem;
}

.badge.admin {
  background: #dbeafe;
  color: #1e3a8a;
}

.badge.employee {
  background: #f3e8ff;
  color: #581c87;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 700;
}

.status-badge.active {
  background: #dcfce7;
  color: #14532d;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #7f1d1d;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
}

.btn-icon.delete:hover {
  background: #fef2f2;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  transition: border-color 0.2s;
  background: white;
}

.form-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.form-select option {
  font-weight: 600;
  color: #0f172a;
  padding: 0.5rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.info-text {
  margin-bottom: 1rem;
  color: #475569;
  font-weight: 600;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.confirm-modal .modal-body {
  padding: 2rem 1.5rem;
}

.confirm-modal .modal-body p {
  margin: 0 0 1rem;
  color: #1e293b;
}

.confirm-modal .modal-body .warning {
  color: #dc2626;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .employee-management {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header .btn {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    overflow-x: scroll;
  }

  .employees-table {
    min-width: 600px;
  }

  .modal-content {
    width: 95%;
    max-width: none;
  }
}
</style>
