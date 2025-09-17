<template>
  <div class="confirmation-overlay" @click.self="handleOverlayClick">
    <div class="confirmation-modal">
      <div class="confirmation-icon">
        <div class="warning-icon">⚠️</div>
      </div>

      <h3>{{ title }}</h3>
      <p>{{ message }}</p>

      <div class="confirmation-actions">
        <button @click="handleCancel" class="btn btn-secondary">
          {{ cancelText }}
        </button>
        <button @click="handleConfirm" class="btn btn-warning">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Confirmar acción',
  message: '¿Estás seguro de que deseas continuar?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar'
})

const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleOverlayClick = () => {
  emit('cancel')
}
</script>

<style scoped>
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: var(--backdrop-blur);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.confirmation-modal {
  background: var(--bg-secondary);
  backdrop-filter: var(--backdrop-blur);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border-primary);
  box-shadow: 0 20px 60px var(--shadow-primary);
  max-width: 480px;
  width: 90%;
  text-align: center;
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.confirmation-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.warning-icon {
  font-size: 3rem;
  filter: drop-shadow(0 2px 8px rgba(255, 193, 7, 0.3));
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.confirmation-modal h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px var(--shadow-primary);
}

.confirmation-modal p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0 0 2rem 0;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--backdrop-blur);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--shadow-secondary);
}

.btn-warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.9), rgba(255, 152, 0, 0.9));
  color: white;
  border: 1px solid rgba(255, 193, 7, 0.3);
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.btn-warning:hover {
  background: linear-gradient(135deg, rgba(255, 193, 7, 1), rgba(255, 152, 0, 1));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
}

/* Responsive */
@media (max-width: 480px) {
  .confirmation-modal {
    margin: 20px;
    padding: 1.5rem;
    max-width: none;
    width: calc(100% - 40px);
  }

  .confirmation-modal h3 {
    font-size: 1.3rem;
  }

  .confirmation-modal p {
    font-size: 1rem;
  }

  .confirmation-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
