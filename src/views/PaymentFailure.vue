<template>
  <div class="payment-failure">
    <div class="container">
      <div class="error-icon">❌</div>
      <h1>Pago Rechazado</h1>
      <p>Hubo un problema con tu pago. Por favor, intenta nuevamente o contacta soporte.</p>
      <div class="actions">
        <button @click="tryAgain" class="btn-primary">Intentar de nuevo</button>
        <button @click="goHome" class="btn-secondary">Volver al inicio</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const tryAgain = () => {
  router.push('/#number-selection')
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.payment-failure {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(248, 113, 113, 0.2);
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(248, 113, 113, 0.5));
}

h1 {
  color: #f87171;
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  color: #e2e8f0;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.4);
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(96, 165, 250, 0.1);
  border-color: #60a5fa;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
