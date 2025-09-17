<template>
  <div class="payment-pending">
    <div class="container">
      <div class="pending-icon">⏳</div>
      <h1>Pago Pendiente</h1>
      <p>Tu pago está siendo procesado. Te notificaremos cuando se complete la transacción.</p>
      <div class="info">
        <p><strong>¿Qué sigue?</strong></p>
        <ul>
          <li>Recibirás una notificación cuando se procese tu pago</li>
          <li>Tus números quedarán reservados temporalmente</li>
          <li>Puedes verificar el estado en tu correo electrónico</li>
        </ul>
      </div>
      <div class="actions">
        <button @click="goHome" class="btn-primary">Volver al inicio</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.payment-pending {
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
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.pending-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

h1 {
  color: #fbbf24;
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  color: #e2e8f0;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.info {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.info p {
  margin-bottom: 1rem;
  color: #fbbf24;
  font-weight: 600;
}

.info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info li {
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.info li::before {
  content: "•";
  color: #fbbf24;
  position: absolute;
  left: 0;
  font-weight: bold;
}

.btn-primary {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}
</style>
