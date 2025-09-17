<template>
  <div v-if="isVisible" class="popup-overlay">
    <div class="popup-content">
      <div class="expired-icon">
        ⚠️
      </div>

      <h2>Membresía Vencida</h2>

      <p class="expired-message">
        Su membresía ha vencido. Por favor, realice el pago lo más pronto posible para continuar usando el sistema.
      </p>

      <div class="countdown-container">
        <div class="countdown-text">
          Este mensaje se cerrará automáticamente en:
        </div>
        <div class="countdown-timer">
          {{ countdown }}s
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])

const isVisible = ref(true)
const countdown = ref(5)
let countdownInterval: number | null = null

const closePopup = () => {
  isVisible.value = false
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  emit('close')
}

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      closePopup()
    }
  }, 1000)
}

onMounted(() => {
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.popup-content {
  background: var(--bg-secondary);
  backdrop-filter: var(--backdrop-blur);
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid var(--border-primary);
  box-shadow: 0 20px 60px rgba(220, 53, 69, 0.3);
  max-width: 500px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.3s ease-out;
  border-left: 6px solid #dc3545;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.expired-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.popup-content h2 {
  color: #dc3545;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px var(--shadow-primary);
}

.expired-message {
  color: var(--text-primary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.countdown-container {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.countdown-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.countdown-timer {
  color: #dc3545;
  font-size: 2rem;
  font-weight: 700;
  animation: countdownPulse 1s infinite;
}

@keyframes countdownPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Dark theme adjustments */
:root[data-theme='dark'] .countdown-container,
:root:not([data-theme]) .countdown-container {
  background: rgba(220, 53, 69, 0.15);
}

/* Light theme adjustments */
:root[data-theme='light'] .countdown-container {
  background: rgba(220, 53, 69, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .popup-content {
    margin: 20px;
    padding: 2rem;
    max-width: none;
    width: calc(100% - 40px);
  }

  .popup-content h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .expired-icon {
    font-size: 3rem;
    margin-bottom: 0.75rem;
  }

  .expired-message {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .countdown-timer {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .popup-content {
    padding: 1.5rem;
  }

  .expired-message {
    font-size: 0.95rem;
  }
}
</style>
