<template>
  <div class="maintenance-container">
    <!-- Elementos decorativos de fondo -->
    <div class="decorative-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
      <div class="gear-container">
        <div class="gear gear-1">⚙️</div>
        <div class="gear gear-2">⚙️</div>
        <div class="gear gear-3">⚙️</div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="maintenance-content">
      <!-- Icono principal con animación -->
      <div class="maintenance-icon">
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
          </svg>
          <div class="pulse-ring"></div>
          <div class="pulse-ring delayed"></div>
        </div>
      </div>

      <!-- Título principal -->
      <h1 class="maintenance-title">
        🔧 Sitio en <span class="highlight">Mantenimiento</span>
      </h1>

      <!-- Descripción -->
      <div class="maintenance-description">
        <p class="main-message">
          Estamos realizando mejoras importantes para brindarte una mejor experiencia.
        </p>
        <p class="sub-message">
          Nuestro equipo está trabajando para que todo esté perfecto muy pronto.
        </p>
      </div>

      <!-- Información de tiempo estimado -->
      <!-- <div class="time-info">
        <div class="time-card">
          <div class="time-icon">⏰</div>
          <div class="time-content">
            <div class="time-label">Tiempo estimado</div>
            <div class="time-value">{{ estimatedTime }}</div>
          </div>
        </div>
      </div> -->

      <!-- Barra de progreso animada
      <div class="progress-container">
        <div class="progress-label">
          <span>Progreso del mantenimiento</span>
          <span class="progress-percentage">{{ progressPercentage.toFixed(1) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          <div class="progress-shimmer"></div>
        </div>
      </div> -->

      <!-- Información de contacto -->
      <div class="contact-info">
        <div class="contact-card">
          <div class="contact-icon">📞</div>
          <div class="contact-content">
            <div class="contact-label">¿Necesitas ayuda urgente?</div>
            <a href="tel:+573118715539" class="contact-link">
              Tel: +57 311 871 5539
            </a>
          </div>
        </div>
      </div>

      <!-- WhatsApp contacto -->
      <div class="whatsapp-contact">
        <div class="whatsapp-title">O escribenos directo al Whatsapp</div>
        <a href="https://wa.me/573118715539?text=Hola,%20necesito%20ayuda%20urgente%20con%20el%20sitio"
           class="whatsapp-btn"
           target="_blank"
           rel="noopener noreferrer">
          <div class="whatsapp-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
            </svg>
          </div>
          <div class="whatsapp-content">
            <span class="whatsapp-text">WhatsApp</span>
            <span class="whatsapp-number">+57 311 871 5539</span>
          </div>
        </a>
      </div>

      <!-- Mensaje de agradecimiento -->
      <div class="thank-you">
        <div class="thank-you-icon">💙</div>
        <p>Gracias por tu paciencia y comprensión.</p>
      </div>
    </div>

    <!-- Footer con información adicional -->
    <div class="maintenance-footer">
      <p>&copy; {{ currentYear }} DigitalWallpapers. Todos los derechos reservados.</p>
      <!-- <p class="last-updated">Última actualización: {{ lastUpdated }}</p> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Define component name to satisfy multi-word requirement
defineOptions({
  name: 'MaintenancePage'
})

// Estado reactivo
const estimatedTime = ref('2-4 horas')
const progressPercentage = ref(0)
const currentYear = new Date().getFullYear()

// Variables para animaciones
let progressInterval: ReturnType<typeof setInterval> | null = null

// Simular progreso del mantenimiento
const startProgressAnimation = () => {
  progressInterval = setInterval(() => {
    if (progressPercentage.value < 95) {
      const increment = Math.random() * 3 + 0.5
      progressPercentage.value = Math.min(95, progressPercentage.value + increment)

      // Actualizar tiempo estimado basado en progreso
      if (progressPercentage.value > 80) {
        estimatedTime.value = '30 minutos'
      } else if (progressPercentage.value > 60) {
        estimatedTime.value = '1 hora'
      } else if (progressPercentage.value > 40) {
        estimatedTime.value = '2 horas'
      } else if (progressPercentage.value > 20) {
        estimatedTime.value = '3 horas'
      }
    }
  }, 2000)
}

// Rotación de engranajes
const startGearAnimation = () => {
  const gears = document.querySelectorAll('.gear')
  gears.forEach((gear, index) => {
    const element = gear as HTMLElement
    let rotation = 0
    const speed = (index + 1) * 2

    const rotateGear = () => {
      rotation += speed
      element.style.transform = `rotate(${rotation}deg)`
    }

    setInterval(rotateGear, 100)
  })
}

onMounted(() => {
  // Iniciar animaciones
  startProgressAnimation()
  setTimeout(startGearAnimation, 500)

  // Progreso inicial aleatorio
  progressPercentage.value = Math.random() * 20 + 10
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
})
</script>

<style scoped>
.maintenance-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem 2rem 2rem; /* Más padding arriba */
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Elementos decorativos */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #8b5cf6 0%, #60a5fa 100%);
  bottom: -100px;
  left: -100px;
  animation-delay: 3s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
  top: 20%;
  left: 10%;
  animation-delay: 6s;
}

.gear-container {
  position: absolute;
  top: 10%;
  right: 10%;
}

.gear {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  color: #60a5fa;
  animation: spin 10s linear infinite;
}

.gear-1 {
  top: 0;
  left: 0;
  font-size: 3rem;
}

.gear-2 {
  top: 50px;
  left: 60px;
  font-size: 2rem;
  animation-direction: reverse;
  animation-duration: 8s;
}

.gear-3 {
  top: -30px;
  left: 120px;
  font-size: 1.5rem;
  animation-duration: 12s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.05;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Contenido principal */
.maintenance-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 600px;
  width: 100%;
  margin-top: 2rem; /* Margen adicional arriba */
}

/* Icono principal */
.maintenance-icon {
  margin-bottom: 2rem;
}

.icon-wrapper {
  position: relative;
  display: inline-block;
}

.icon-wrapper svg {
  width: 120px;
  height: 120px;
  color: #60a5fa;
  filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.3));
  animation: iconPulse 3s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border: 2px solid rgba(96, 165, 250, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

.pulse-ring.delayed {
  animation-delay: 1s;
  width: 160px;
  height: 160px;
  border-color: rgba(96, 165, 250, 0.2);
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.8);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

/* Título */
.maintenance-title {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.highlight {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Descripción */
.maintenance-description {
  margin-bottom: 3rem;
}

.main-message {
  font-size: 1.3rem;
  color: #e2e8f0;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.sub-message {
  font-size: 1.1rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

/* Información de tiempo */
.time-info {
  margin-bottom: 3rem;
}

.time-card {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.time-icon {
  font-size: 2rem;
  animation: bounce 2s ease-in-out infinite;
}

.time-content {
  text-align: left;
}

.time-label {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.time-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #60a5fa;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* Barra de progreso */
.progress-container {
  margin-bottom: 3rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #e2e8f0;
  font-weight: 600;
}

.progress-percentage {
  color: #60a5fa;
  font-weight: 700;
}

.progress-bar {
  position: relative;
  background: rgba(51, 65, 85, 0.6);
  border-radius: 12px;
  height: 16px;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #06b6d4, #3b82f6);
  border-radius: 12px;
  transition: width 1s ease;
  position: relative;
  overflow: hidden;
}

.progress-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Información de contacto */
.contact-info {
  margin-bottom: 3rem;
}

.contact-card {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.contact-card:hover {
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.1);
}

.contact-icon {
  font-size: 1.8rem;
}

.contact-content {
  text-align: left;
}

.contact-label {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.contact-link {
  font-size: 1.1rem;
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #93c5fd;
  text-decoration: underline;
}

/* WhatsApp contacto */
.whatsapp-contact {
  margin-bottom: 3rem;
}

.whatsapp-title {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
  text-align: center;
}

.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);
  min-width: 280px;
  justify-content: center;
}

.whatsapp-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(37, 211, 102, 0.4);
  background: linear-gradient(135deg, #128c7e 0%, #25d366 100%);
}

.whatsapp-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.whatsapp-icon svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.whatsapp-content {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.whatsapp-text {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.2;
}

.whatsapp-number {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
  margin-top: 0.1rem;
}

.whatsapp-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  opacity: 0;
  animation: whatsappPulse 3s ease-in-out infinite;
}

@keyframes whatsappPulse {
  0%, 70%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
  35% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

/* Mensaje de agradecimiento */
.thank-you {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.thank-you-icon {
  font-size: 1.5rem;
  animation: heartbeat 2s ease-in-out infinite;
}

.thank-you p {
  font-size: 1.1rem;
  color: #cbd5e1;
  font-style: italic;
  margin: 0;
}

@keyframes heartbeat {
  0%, 50%, 100% { transform: scale(1); }
  25%, 75% { transform: scale(1.1); }
}

/* Footer */
.maintenance-footer {
  position: relative;
  z-index: 10;
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(96, 165, 250, 0.2);
}

.maintenance-footer p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.last-updated {
  font-size: 0.8rem !important;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .maintenance-container {
    padding: 2rem 1rem 1rem 1rem; /* Menos padding en móviles */
  }

  .maintenance-content {
    margin-top: 1rem; /* Menos margen en móviles */
  }

  .maintenance-title {
    font-size: 2.2rem;
  }

  .main-message {
    font-size: 1.1rem;
  }

  .sub-message {
    font-size: 1rem;
  }

  .time-card,
  .contact-card {
    flex-direction: column;
    text-align: center;
  }

  .time-content,
  .contact-content {
    text-align: center;
  }

  .whatsapp-btn {
    min-width: 250px;
    padding: 0.9rem 1.5rem;
  }

  .whatsapp-content {
    text-align: center;
  }

  .gear-container {
    display: none;
  }
}

@media (max-width: 480px) {
  .maintenance-container {
    padding: 3rem 1rem 1rem 1rem; /* Más padding arriba en móviles pequeños */
  }

  .maintenance-content {
    margin-top: 1.5rem; /* Más margen arriba en móviles pequeños */
  }

  .maintenance-title {
    font-size: 1.8rem;
  }

  .maintenance-description {
    margin-bottom: 2rem; /* Menos margen en móviles pequeños */
  }

  .contact-info {
    margin-bottom: 2rem; /* Menos margen en móviles pequeños */
  }

  .whatsapp-contact {
    margin-bottom: 2rem; /* Menos margen en móviles pequeños */
  }

  .maintenance-icon {
    margin-bottom: 1.5rem; /* Menos margen en móviles */
  }

  .icon-wrapper svg {
    width: 80px;
    height: 80px;
  }

  .pulse-ring {
    width: 100px;
    height: 100px;
  }

  .pulse-ring.delayed {
    width: 120px;
    height: 120px;
  }

  .time-card,
  .contact-card {
    padding: 1rem;
  }

  .whatsapp-btn {
    min-width: 220px;
    padding: 0.8rem 1.2rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .whatsapp-content {
    text-align: center;
  }

  .whatsapp-text {
    font-size: 1rem;
  }

  .whatsapp-number {
    font-size: 0.85rem;
  }
}
</style>
