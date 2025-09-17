<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Reglas</h3>
        <button class="close-btn" @click="closeModal">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="rule-section">
          <h4>🎯 Participación</h4>
          <ul>
            <li>Cada Wallpaper tiene un costo de $15.000 COP</li>
            <li>Los números van del 001 al 5000</li>
            <li>Una vez comprado, el Wallpaper queda reservado para ti</li>
          </ul>
        </div>

        <div class="rule-section">
          <h4>📅 Fechas importantes</h4>
          <ul>
            <li>Transmisión en vivo por nuestras redes sociales</li>
          </ul>
        </div>

        <!-- <div class="rule-section">
          <h4>🏆 Premios</h4>
          <ul>
            <li>Motocicleta 200 NS</li>
          </ul>
        </div> -->
<!--
        <div class="rule-section">
          <h4>⚖️ Condiciones generales</h4>
          <ul>
            <li>La dinámica se llevará a cabo una vez alcanzado el 50% de los fondos vendidos</li>
          </ul>
        </div> -->


      </div>

      <div class="modal-footer">
        <button class="accept-btn" @click="closeModal">
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
}

.modal-header h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.modal-body {
  padding: 1.5rem 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(96, 165, 250, 0.5);
  border-radius: 3px;
}

.rule-section {
  margin-bottom: 2rem;
}

.rule-section h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #60a5fa;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rule-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rule-section li {
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.rule-section li::before {
  content: "•";
  color: #60a5fa;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.demo-notice {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 2rem;
}

.demo-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.demo-text {
  color: #fca5a5;
  font-size: 0.9rem;
  line-height: 1.5;
}

.demo-text strong {
  color: #ef4444;
}

.modal-footer {
  padding: 1.5rem 2rem 2rem 2rem;
  border-top: 1px solid rgba(96, 165, 250, 0.2);
  display: flex;
  justify-content: center;
}

.accept-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.accept-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .modal-header h3 {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 1rem 1.5rem;
    max-height: 70vh;
  }

  .modal-footer {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }

  .rule-section h4 {
    font-size: 1.1rem;
  }

  .rule-section li {
    font-size: 0.9rem;
  }

  .demo-notice {
    padding: 1rem;
  }

  .demo-text {
    font-size: 0.85rem;
  }
}
</style>
