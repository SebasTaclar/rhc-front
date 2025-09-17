<template>
  <div class="modal-backdrop" @click="handleBackdropClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Términos y Condiciones</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="terms-content">
          <div class="warning-icon">⚠️</div>

            <strong>Consulta el documento completo aquí:</strong>
            <a class="terms-link" href="images/terminos-condiciones.pdf" target="_blank" rel="noopener noreferrer">
              Ver PDF de Términos y Condiciones
            </a>

          <div class="checkbox-container">
            <label class="checkbox-label">
              <input type="checkbox" v-model="accepted" class="checkbox-input" />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Acepto los términos y condiciones</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          Cancelar
        </button>
        <button @click="handleAccept" :disabled="!accepted" class="btn-accept" :class="{ 'disabled': !accepted }">
          Continuar con el pago
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Emits
const emit = defineEmits<{
  close: []
  accept: []
}>()

// Estado
const accepted = ref(false)

// Métodos
const handleBackdropClick = () => {
  emit('close')
}

const handleAccept = () => {
  if (accepted.value) {
    emit('accept')
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: linear-gradient(145deg, #1e293b, #334155);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(96, 165, 250, 0.2);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(96, 165, 250, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
}

.terms-content {
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
  animation: pulse 2s ease-in-out infinite;
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

.terms-text {
  color: #e2e8f0;
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 3rem;
  text-align: left;
  background: rgba(15, 23, 42, 0.5);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #fbbf24;
}

.terms-link {
  display: inline-block;
  margin-top: 0.75rem;
  color: #60a5fa;
  font-weight: 600;
  text-decoration: none;
  position: relative;
  padding-right: 1.2rem;
  transition: color 0.3s ease;
}

.terms-link::after {
  content: '\2197'; /* flecha diagonal */
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.8;
}

.terms-link:hover {
  color: #93c5fd;
  text-decoration: underline;
}

.checkbox-container {
  margin-top: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  text-align: left;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #64748b;
  border-radius: 4px;
  background: transparent;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-input:checked+.checkbox-custom {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
}

.checkbox-input:checked+.checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.checkbox-text {
  color: #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.5;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(96, 165, 250, 0.2);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.3);
}

.btn-cancel,
.btn-accept {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-cancel {
  background: rgba(51, 65, 85, 0.8);
  color: #e2e8f0;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.btn-cancel:hover {
  background: rgba(96, 165, 250, 0.1);
  border-color: #60a5fa;
  transform: translateY(-2px);
}

.btn-accept {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  min-width: 180px;
  position: relative;
}

.btn-accept:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.btn-accept:not(.disabled)::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-accept:not(.disabled):hover::before {
  left: 100%;
}

.btn-accept.disabled {
  background: rgba(71, 85, 105, 0.5);
  color: rgba(226, 232, 240, 0.5);
  cursor: not-allowed;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-accept {
    width: 100%;
    justify-content: center;
  }

  .terms-text {
    font-size: 0.95rem;
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .modal-header h2 {
    font-size: 1.25rem;
  }

  .terms-text {
    font-size: 0.9rem;
  }

  .warning-icon {
    font-size: 2.5rem;
  }
}
</style>
