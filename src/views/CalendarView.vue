<template>
  <div class="calendar-view">
    <div class="calendar-container">
      <!-- Header profesional -->
      <div class="calendar-header">
        <div class="header-content">
          <div class="header-icon">📅</div>
          <div class="header-text">
            <h1 class="header-title">Calendario Tributario</h1>
            <p class="header-subtitle">Fechas importantes y vencimientos fiscales</p>
          </div>
        </div>
      </div>

      <!-- Contenido del calendario -->
      <div class="calendar-content">
        <TaxCalendarSection />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TaxCalendarSection from '@/components/TaxCalendarSection.vue'

defineOptions({
  name: 'CalendarView'
})
</script>

<style scoped>
.calendar-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.calendar-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.calendar-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.calendar-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.calendar-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.header-icon {
  font-size: 5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.95;
  font-weight: 300;
}

.calendar-content {
  padding: 2rem;
  background: white;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-view {
    padding: 1rem 0.5rem;
  }

  .calendar-container {
    border-radius: 12px;
  }

  .calendar-header {
    padding: 2rem 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-icon {
    font-size: 3.5rem;
  }

  .header-title {
    font-size: 1.8rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .calendar-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }
}
</style>
