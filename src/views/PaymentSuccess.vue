<template>
  <div class="payment-success">
    <div class="container">
      <div class="success-icon">✅</div>
      <h1>¡Pago Exitoso!</h1>
      <p>Tu pago se ha procesado correctamente. Tus números han sido reservados.</p>
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
.payment-success {
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
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.success-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5));
}

h1 {
  color: #22c55e;
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  color: #e2e8f0;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}
</style>
