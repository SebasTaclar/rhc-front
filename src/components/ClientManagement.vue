<template>
  <div class="client-management">
    <div class="header">
      <h2>Gestión de Clientes</h2>
      <button @click="openCreateModal" class="btn btn-primary">
        <span class="icon">+</span>
        Nuevo Cliente
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando clientes...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- Tabla de clientes -->
    <div v-if="!loading && clients.length > 0" class="table-container">
      <table class="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Razón Social</th>
            <th>NIT</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Ciudad</th>
            <th>Sector</th>
            <th>Servicios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id">
            <td>{{ client.id }}</td>
            <td><strong>{{ client.businessName }}</strong></td>
            <td>{{ client.nit || '-' }}</td>
            <td>{{ client.phone }}</td>
            <td>{{ client.email || '-' }}</td>
            <td>{{ client.city || '-' }}</td>
            <td>
              <span v-if="client.sector" class="badge">{{ client.sector }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <div v-if="client.contractedServices && client.contractedServices.length > 0" class="services-list">
                <span
                  v-for="(service, idx) in client.contractedServices"
                  :key="idx"
                  class="service-tag"
                >
                  {{ service }}
                </span>
              </div>
              <span v-else>-</span>
            </td>
            <td class="actions">
              <button @click="openEditModal(client)" class="btn-icon" title="Editar">
                ✏️
              </button>
              <button @click="viewClient(client)" class="btn-icon" title="Ver detalles">
                👁️
              </button>
              <button @click="confirmDelete(client)" class="btn-icon delete" title="Eliminar">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sin clientes -->
    <div v-if="!loading && clients.length === 0" class="empty-state">
      <p>No hay clientes registrados</p>
      <button @click="openCreateModal" class="btn btn-primary">Crear Primer Cliente</button>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Razón Social * <span class="required">(obligatorio)</span></label>
              <input
                v-model="formData.businessName"
                type="text"
                class="form-input"
                required
                placeholder="Nombre o razón social del cliente"
              />
            </div>

            <div class="form-group">
              <label>Teléfono * <span class="required">(obligatorio)</span></label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-input"
                required
                placeholder="3001234567"
              />
            </div>

            <div class="form-group">
              <label>NIT</label>
              <input
                v-model="formData.nit"
                type="text"
                class="form-input"
                placeholder="900123456-7"
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="correo@empresa.com"
              />
            </div>

            <div class="form-group">
              <label>Ciudad</label>
              <input
                v-model="formData.city"
                type="text"
                class="form-input"
                placeholder="Bogotá"
              />
            </div>

            <div class="form-group">
              <label>Sector</label>
              <select v-model="formData.sector" class="form-select">
                <option value="">Seleccionar sector</option>
                <option value="Comercio">Comercio</option>
                <option value="Servicios">Servicios</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Manufactura">Manufactura</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Construcción">Construcción</option>
                <option value="Transporte">Transporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Dirección</label>
              <input
                v-model="formData.address"
                type="text"
                class="form-input"
                placeholder="Carrera 15 # 93-45"
              />
            </div>

            <div class="form-group full-width">
              <label>Servicios Contratados</label>
              <div class="services-input">
                <div class="selected-services">
                  <span
                    v-for="(service, idx) in formData.contractedServices"
                    :key="idx"
                    class="service-chip"
                  >
                    {{ service }}
                    <button
                      type="button"
                      @click="removeService(idx)"
                      class="remove-service"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <div class="add-service">
                  <input
                    v-model="newService"
                    type="text"
                    class="form-input"
                    placeholder="Ej: Declaración de Renta"
                    @keypress.enter.prevent="addService"
                  />
                  <button
                    type="button"
                    @click="addService"
                    class="btn btn-secondary btn-sm"
                  >
                    Agregar
                  </button>
                </div>
                <small>Presiona Enter o click en Agregar para añadir un servicio</small>
              </div>
            </div>
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

    <!-- Modal Ver Detalles -->
    <div v-if="showViewModal" class="modal-overlay" @click="showViewModal = false">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <h3>Detalles del Cliente</h3>
          <button @click="showViewModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedClient">
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID:</label>
              <span>{{ selectedClient.id }}</span>
            </div>
            <div class="detail-item">
              <label>Razón Social:</label>
              <span><strong>{{ selectedClient.businessName }}</strong></span>
            </div>
            <div class="detail-item">
              <label>NIT:</label>
              <span>{{ selectedClient.nit || 'No especificado' }}</span>
            </div>
            <div class="detail-item">
              <label>Teléfono:</label>
              <span>{{ selectedClient.phone }}</span>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ selectedClient.email || 'No especificado' }}</span>
            </div>
            <div class="detail-item">
              <label>Ciudad:</label>
              <span>{{ selectedClient.city || 'No especificada' }}</span>
            </div>
            <div class="detail-item">
              <label>Sector:</label>
              <span>{{ selectedClient.sector || 'No especificado' }}</span>
            </div>
            <div class="detail-item">
              <label>Dirección:</label>
              <span>{{ selectedClient.address || 'No especificada' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>Servicios Contratados:</label>
              <div v-if="selectedClient.contractedServices && selectedClient.contractedServices.length > 0" class="services-detail">
                <span
                  v-for="(service, idx) in selectedClient.contractedServices"
                  :key="idx"
                  class="service-tag"
                >
                  {{ service }}
                </span>
              </div>
              <span v-else>No hay servicios contratados</span>
            </div>
            <div class="detail-item">
              <label>Fecha de Creación:</label>
              <span>{{ formatDate(selectedClient.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Última Actualización:</label>
              <span>{{ formatDate(selectedClient.updatedAt) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showViewModal = false" class="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <p>¿Está seguro de eliminar al cliente <strong>{{ clientToDelete?.businessName }}</strong>?</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useClients } from '@/composables/useClients'
import type { Client } from '@/types/ClientApiType'

const {
  clients,
  loading,
  error,
  fetchClients,
  createClient,
  updateClient,
  deleteClient
} = useClients()

const showModal = ref(false)
const showViewModal = ref(false)
const showConfirmModal = ref(false)
const isEditMode = ref(false)
const clientToDelete = ref<Client | null>(null)
const selectedClient = ref<Client | null>(null)
const newService = ref('')

const formData = ref({
  businessName: '',
  phone: '',
  nit: '',
  city: '',
  sector: '',
  email: '',
  address: '',
  contractedServices: [] as string[]
})

const currentClientId = ref<number | null>(null)

// Cargar clientes al montar
onMounted(() => {
  fetchClients()
})

// Formatear fecha
const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Abrir modal de creación
const openCreateModal = () => {
  isEditMode.value = false
  formData.value = {
    businessName: '',
    phone: '',
    nit: '',
    city: '',
    sector: '',
    email: '',
    address: '',
    contractedServices: []
  }
  showModal.value = true
}

// Abrir modal de edición
const openEditModal = (client: Client) => {
  isEditMode.value = true
  currentClientId.value = client.id
  formData.value = {
    businessName: client.businessName,
    phone: client.phone,
    nit: client.nit || '',
    city: client.city || '',
    sector: client.sector || '',
    email: client.email || '',
    address: client.address || '',
    contractedServices: client.contractedServices ? [...client.contractedServices] : []
  }
  showModal.value = true
}

// Cerrar modal
const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  currentClientId.value = null
  newService.value = ''
}

// Ver detalles del cliente
const viewClient = (client: Client) => {
  selectedClient.value = client
  showViewModal.value = true
}

// Agregar servicio
const addService = () => {
  if (newService.value.trim()) {
    formData.value.contractedServices.push(newService.value.trim())
    newService.value = ''
  }
}

// Eliminar servicio
const removeService = (index: number) => {
  formData.value.contractedServices.splice(index, 1)
}

// Manejar envío del formulario
const handleSubmit = async () => {
  const data = {
    businessName: formData.value.businessName,
    phone: formData.value.phone,
    nit: formData.value.nit || null,
    city: formData.value.city || null,
    sector: formData.value.sector || null,
    email: formData.value.email || null,
    address: formData.value.address || null,
    contractedServices: formData.value.contractedServices.length > 0
      ? formData.value.contractedServices
      : null
  }

  if (isEditMode.value && currentClientId.value) {
    await updateClient(currentClientId.value, data)
  } else {
    await createClient(data)
  }

  if (!error.value) {
    closeModal()
  }
}

// Confirmar eliminación
const confirmDelete = (client: Client) => {
  clientToDelete.value = client
  showConfirmModal.value = true
}

// Eliminar cliente
const handleDelete = async () => {
  if (clientToDelete.value) {
    await deleteClient(clientToDelete.value.id)
    showConfirmModal.value = false
    clientToDelete.value = null
  }
}
</script>

<style scoped>
.client-management {
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
  color: #1e293b;
  margin: 0;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
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

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.clients-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.clients-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
}

.clients-table tbody tr:hover {
  background: #f8fafc;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #e0e7ff;
  color: #3730a3;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  max-width: 250px;
}

.service-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  background: #dbeafe;
  color: #1e40af;
  white-space: nowrap;
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

.view-modal {
  max-width: 600px;
}

.confirm-modal {
  max-width: 450px;
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
  font-weight: 600;
  color: #1e293b;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 400;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #1f2937;
  transition: border-color 0.2s;
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

.services-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selected-services {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0.5rem;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
}

.service-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 0.875rem;
}

.remove-service {
  background: none;
  border: none;
  color: #1e40af;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.remove-service:hover {
  background: rgba(30, 64, 175, 0.1);
}

.add-service {
  display: flex;
  gap: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
}

.detail-item span {
  color: #1e293b;
}

.services-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
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
  .client-management {
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

  .clients-table {
    min-width: 1000px;
  }

  .modal-content {
    width: 95%;
    max-width: none;
  }

  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: 1;
  }
}
</style>
