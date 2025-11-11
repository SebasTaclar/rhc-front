<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ mode === 'create' ? 'Crear Nuevo Evento' : 'Editar Evento' }}</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="title">Título *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            placeholder="Nombre del evento"
          />
        </div>

        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Detalles adicionales del evento"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Fecha y Hora de Inicio *</label>
            <input
              id="startDate"
              v-model="formData.startDate"
              type="datetime-local"
              required
            />
          </div>

          <div class="form-group">
            <label for="endDate">Fecha y Hora de Fin *</label>
            <input
              id="endDate"
              v-model="formData.endDate"
              type="datetime-local"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="eventType">Tipo de Evento *</label>
            <select id="eventType" v-model="formData.eventType" required>
              <option value="MEETING">Reunión</option>
              <option value="DEADLINE">Fecha Límite</option>
              <option value="REMINDER">Recordatorio</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.isPrivate"
              />
              <span class="checkbox-text">
                <span class="checkbox-icon">{{ formData.isPrivate ? '🔒' : '🌐' }}</span>
                {{ formData.isPrivate ? 'Evento Privado' : 'Evento Público' }}
              </span>
            </label>
            <p class="help-text">
              {{ formData.isPrivate
                ? 'Solo usuarios autenticados podrán ver este evento'
                : 'Todos los visitantes podrán ver este evento'
              }}
            </p>
          </div>
        </div>

        <!-- Cliente (opcional) -->
        <div class="form-group">
          <label for="client">Cliente (opcional)</label>
          <select id="client" v-model="selectedClientId" class="form-select-client">
            <option value="">Seleccionar cliente...</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.businessName }}
            </option>
          </select>
        </div>

        <!-- Empleados (opcional) -->
        <div class="form-group">
          <label>
            Empleados asignados (opcional)
            <span v-if="formData.employeeIds.length > 0" class="selected-count">
              {{ formData.employeeIds.length }} seleccionado{{ formData.employeeIds.length > 1 ? 's' : '' }}
            </span>
          </label>
          <div class="employees-selection">
            <label
              v-for="employee in employees"
              :key="employee.id"
              class="employee-option"
            >
              <input
                type="checkbox"
                :value="employee.id"
                v-model="formData.employeeIds"
                class="employee-checkbox"
              />
              <div class="employee-info">
                <div class="employee-avatar">
                  {{ getInitials(employee.name) }}
                </div>
                <div class="employee-details">
                  <span class="employee-name">{{ employee.name }}</span>
                  <span class="employee-role">{{ employee.role }}</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-save" :disabled="!isFormValid">
            {{ mode === 'create' ? 'Crear Evento' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Event, EventType } from '@/types/EventType'
import { useClients } from '@/composables/useClients'
import { useEmployees } from '@/composables/useEmployees'

interface Props {
  event?: Event | null
  mode: 'create' | 'edit'
}

interface EventFormData {
  title: string
  description?: string
  startDate: string
  endDate: string
  eventType: EventType
  isPrivate: boolean
  clientIds?: number[]
  employeeIds?: number[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'close': []
  'save': [data: EventFormData]
}>()

// Composables para obtener clientes y empleados
const { clients, fetchClients } = useClients()
const { employees, fetchEmployees } = useEmployees()

const formData = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  eventType: 'MEETING' as EventType,
  isPrivate: false,
  clientIds: [] as number[],
  employeeIds: [] as number[]
})

const selectedClientId = ref<number | string>('')

// Cargar datos al montar
onMounted(async () => {
  await Promise.all([fetchClients(), fetchEmployees()])
})

// Función para obtener iniciales
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Watch para actualizar clientIds cuando cambia selectedClientId
watch(selectedClientId, (newVal) => {
  if (newVal) {
    formData.value.clientIds = [Number(newVal)]
  } else {
    formData.value.clientIds = []
  }
})

// Inicializar formulario con datos del evento si está en modo edición
watch(() => props.event, (newEvent) => {
  if (newEvent && props.mode === 'edit') {
    // Obtener IDs de clientes (del campo directo o extrayendo del objeto)
    const clientIdsToUse = newEvent.clientIds || newEvent.clients?.map(c => c.id) || []

    // Obtener IDs de empleados (del campo directo o extrayendo del objeto)
    const employeeIdsToUse = newEvent.employeeIds || newEvent.employees?.map(e => e.id) || []

    formData.value = {
      title: newEvent.title,
      description: newEvent.description || '',
      startDate: formatDateTimeLocal(newEvent.startDate),
      endDate: formatDateTimeLocal(newEvent.endDate || ''),
      eventType: newEvent.eventType,
      isPrivate: newEvent.isPrivate,
      clientIds: clientIdsToUse,
      employeeIds: employeeIdsToUse
    }

    // Inicializar cliente seleccionado
    selectedClientId.value = clientIdsToUse.length > 0 ? clientIdsToUse[0] : ''
  }
}, { immediate: true })

// Validación del formulario
const isFormValid = computed(() => {
  return formData.value.title.trim() !== '' &&
         formData.value.startDate !== '' &&
         formData.value.endDate !== '' &&
         new Date(formData.value.startDate) < new Date(formData.value.endDate)
})

// Manejar envío del formulario
const handleSubmit = () => {
  if (isFormValid.value) {
    emit('save', {
      title: formData.value.title.trim(),
      description: formData.value.description.trim() || undefined,
      startDate: new Date(formData.value.startDate).toISOString(),
      endDate: new Date(formData.value.endDate).toISOString(),
      eventType: formData.value.eventType,
      isPrivate: formData.value.isPrivate,
      clientIds: formData.value.clientIds.length > 0 ? formData.value.clientIds : undefined,
      employeeIds: formData.value.employeeIds.length > 0 ? formData.value.employeeIds : undefined
    })
  }
}

// Formatear fecha para input datetime-local
const formatDateTimeLocal = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
</script>

<style scoped>
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
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px 16px 0 0;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.9;
  transition: opacity 0.2s ease;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-group input[type="text"],
.form-group input[type="datetime-local"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  transition: all 0.2s ease;
  font-family: inherit;
  background: white;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.form-group select option {
  font-weight: 600;
  color: #0f172a;
  padding: 0.5rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.checkbox-label:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #0f172a;
  font-size: 1rem;
}

.checkbox-icon {
  font-size: 1.25rem;
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
  font-style: italic;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #0f172a;
  font-weight: 700;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Estilos para selección de cliente */
.form-select-client {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-select-client option {
  font-weight: 600;
  color: #0f172a;
  padding: 0.5rem;
}

.form-select-client:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Estilos para selección de empleados */
.employees-selection {
  max-height: 300px;
  overflow-y: auto;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  background: #fafafa;
}

.employee-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid #e2e8f0;
}

.employee-option:hover {
  background: #f8fafc;
  border-color: #667eea;
  transform: translateX(4px);
}

.employee-checkbox {
  width: 18px;
  height: 18px;
  margin-right: 0.75rem;
  cursor: pointer;
  accent-color: #667eea;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.employee-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1e293b;
}

.employee-role {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.selected-count {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    margin: 0;
    border-radius: 12px;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
