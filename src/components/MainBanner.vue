<template>
  <section class="hero-rifa">
    <!-- Galería de fotos de la moto -->
    <div class="moto-gallery-section">
      <div class="gallery-container">
        <div class="gallery-header">
          <h1>Adquiere tus <span class="highlight-blue">DigitalWallpapers</span></h1>
          <h1></h1>
        </div>

        <!-- Galería horizontal en .horizontal-gallery -->
        <div
          class="horizontal-gallery"
          ref="galleryRef"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div
            v-for="(image, index) in motoImages"
            :key="index"
            class="gallery-image-item"
            :class="{ 'active': currentImageIndex === index }"
            @click="goToImage(index)">
            <div class="image-wrapper">
              <img :src="image.src"  />
              <div class="image-overlay">
                <div class="image-info">
                  <h3>{{ image.title }}</h3>

                </div>
              </div>
            </div>
          </div>

        </div>


        <!-- Navegación con flechas a los lados -->
        <div class="gallery-navigation">
          <button class="gallery-nav-arrow gallery-prev" @click="prevImage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <button class="gallery-nav-arrow gallery-next" @click="nextImage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
 <!-- Sección de modificaciones de la moto (colocada debajo de la galería) -->
          <div class="moto-modifications" ref="motoModRef">
            <div class="moto-modifications-inner" ref="motoInnerRef">
              <p class="modifications-description">
                Esta <span class="highlight-text">Motocicleta</span> incluye:
                <strong>Cúpula Nueva, Retrovisores Nuevos, Tapas Laterales Nuevas y Emblemas Nuevos.</strong>
              </p>
            </div>
          </div>
        </div>





        <!-- Contenido centrado debajo de la galería -->
        <div class="content-wrapper">




          <!-- Botones de acción -->
          <div class="action-buttons">
            <button class="btn-primary" @click="selectNumbers">Elegir números</button>
            <button class="btn-secondary" @click="viewRules">Ver reglas</button>
          </div>
           <!-- Estadísticas -->
          <div class="stats-section stats-centered">
            <div class="stat-card">
              <div class="stat-value">$ 15.000 COP</div>
              <div class="stat-label">por número</div>
            </div>
          <!-- <div class="stat-card">
            <div class="stat-value">{{ availabilityText }}</div>
            <div class="stat-label">disponibles</div>
          </div> -->
        </div>
        </div> <!-- Cierre content-wrapper -->
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNumbersAvailability } from '@/composables/useNumbersAvailability'

// Definir emits
interface Emits {
  (e: 'showRules'): void
}

const emit = defineEmits<Emits>()

// Usar el composable de disponibilidad
const {
  // availabilityText,
  // getAvailableNumbersArray
} = useNumbersAvailability()

// // Función para simular más ventas (demo)
// const simulateMoreSales = () => {
//   const available = getAvailableNumbersArray()
//   if (available.length > 5) {
//     // Simular venta de 3-7 números aleatorios
//     const numToSell = Math.floor(Math.random() * 5) + 3
//     const soldNumbers = []

//     for (let i = 0; i < numToSell && i < available.length; i++) {
//       const randomIndex = Math.floor(Math.random() * available.length)
//       soldNumbers.push(available[randomIndex])
//       addTakenNumber(available[randomIndex])
//       available.splice(randomIndex, 1)
//     }

//     alert(`Demo: Se simuló la venta de ${soldNumbers.length} números: ${soldNumbers.join(', ')}`)
//   } else {
//     alert('Demo: No hay suficientes números disponibles para simular más ventas')
//   }
// }

// // Función para resetear la demo
// const resetDemo = () => {
//   resetToDefaults()
//   alert('Demo: Números resetados a los valores por defecto')
// }

// // Función para limpiar la demo
// const clearDemo = () => {
//   if (confirm('¿Estás seguro de que quieres limpiar todos los números reservados?')) {
//     clearAllReserved()
//     alert('Demo: Todos los números han sido liberados')
//   }
// }

// Datos de las imágenes de la moto
const motoImages = ref([
  {
    src: '/images/ns200_slide1.jpeg',
    title: 'Moto NS200s',
  },
  {
    src: '/images/ns200_slide2.jpeg',
    title: 'Diseño agresivo frontal',
  },
  {
    src: '/images/ns200_slide3.jpg',
    title: 'Perfil deportivo completo',
  },
  {
    src: '/images/ns200_slide4.jpeg',
    title: 'Diseño deportivo',
  },
  {
    src: '/images/ns200_slide5.jpg',
    title: 'Alta tecnología',
  },
  {
    src: '/images/ns200_slide6.jpg',
    title: 'Tecnología avanzada',
  },
  {
    src: '/images/ns200_slide7.jpeg',
    title: 'Sistema amigable',
  }
])

const currentImageIndex = ref(0)
const galleryRef = ref<HTMLElement | null>(null)
const motoModRef = ref<HTMLElement | null>(null)
const motoInnerRef = ref<HTMLElement | null>(null)
// Listeners que se asignan en onMounted para poder limpiarlos en onUnmounted
let onGalleryScroll: (() => void) | null = null
let onResize: (() => void) | null = null

// Variables para gestos táctiles
const touchStartX = ref(0)
const touchStartY = ref(0)
const isDragging = ref(false)
const startScrollLeft = ref(0)
const lastTouchX = ref(0)
const lastTouchTime = ref(0)
const velocityX = ref(0)

// Funciones para el carousel de imágenes con scroll horizontal optimizado
const nextImage = () => {
  if (galleryRef.value) {
    const isMobile = window.innerWidth <= 768
    const scrollAmount = isMobile ? galleryRef.value.clientWidth * 0.85 : 420

    // Scroll más rápido y directo para botones
    galleryRef.value.scrollBy({
      left: scrollAmount,
      behavior: 'auto' // Cambio a auto para scroll inmediato
    })

    // Actualizar índice si es mobile
    if (isMobile) {
      const newIndex = Math.min(currentImageIndex.value + 1, motoImages.value.length - 1)
      currentImageIndex.value = newIndex
    }
  }
}

const prevImage = () => {
  if (galleryRef.value) {
    const isMobile = window.innerWidth <= 768
    const scrollAmount = isMobile ? galleryRef.value.clientWidth * 0.85 : 420

    // Scroll más rápido y directo para botones
    galleryRef.value.scrollBy({
      left: -scrollAmount,
      behavior: 'auto' // Cambio a auto para scroll inmediato
    })

    // Actualizar índice si es mobile
    if (isMobile) {
      const newIndex = Math.max(currentImageIndex.value - 1, 0)
      currentImageIndex.value = newIndex
    }
  }
}

// Utilidades de métrica y animación para snap
const getGalleryMetrics = () => {
  const el = galleryRef.value
  if (!el) return { item: 0, gap: 0, pad: 0 }
  const firstItem = el.querySelector('.gallery-image-item') as HTMLElement | null
  const styles = window.getComputedStyle(el)
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0
  const pad = parseFloat(styles.paddingLeft || '0') || 0
  const item = firstItem ? firstItem.clientWidth : 0
  return { item, gap, pad }
}

const animateScrollTo = (targetLeft: number, duration = 450) => {
  const el = galleryRef.value
  if (!el) return
  const start = el.scrollLeft
  const dist = targetLeft - start
  const startTime = performance.now()
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const step = (now: number) => {
    const p = Math.min(1, (now - startTime) / duration)
    el.scrollLeft = start + dist * easeOutCubic(p)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// Funciones para gestos táctiles con arrastre y snap
const handleTouchStart = (e: TouchEvent) => {
  if (!galleryRef.value) return
  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  lastTouchX.value = touch.clientX
  lastTouchTime.value = performance.now()
  isDragging.value = true
  startScrollLeft.value = galleryRef.value.scrollLeft
  // Desactivar snap y smooth durante el drag para seguir el dedo
  galleryRef.value.style.scrollSnapType = 'none'
  galleryRef.value.style.scrollBehavior = 'auto'
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !galleryRef.value) return
  const touch = e.touches[0]
  const dx = touch.clientX - touchStartX.value
  const dy = Math.abs(touch.clientY - touchStartY.value)
  // Si el gesto es predominantemente horizontal, prevenimos el scroll vertical
  if (Math.abs(dx) > dy) {
    e.preventDefault()
    galleryRef.value.scrollLeft = startScrollLeft.value - dx
  }
  // Calcular velocidad aproximada
  const now = performance.now()
  const dt = now - lastTouchTime.value
  if (dt > 0) velocityX.value = (touch.clientX - lastTouchX.value) / dt
  lastTouchX.value = touch.clientX
  lastTouchTime.value = now
}

const handleTouchEnd = () => {
  if (!galleryRef.value) return
  isDragging.value = false
  // Rehabilitar snap visual tras calcular destino
  const el = galleryRef.value
  const { item, gap, pad } = getGalleryMetrics()
  const unit = item + gap
  // Ajustar posición relativa descontando padding
  const raw = Math.max(0, el.scrollLeft - pad)
  let targetIndex = unit > 0 ? Math.round(raw / unit) : currentImageIndex.value
  targetIndex = Math.max(0, Math.min(targetIndex, (motoImages.value?.length || 1) - 1))
  const targetLeft = pad + targetIndex * unit
  // Animar al destino y luego restaurar propiedades
  animateScrollTo(targetLeft, 450)
  // Actualizamos índice
  currentImageIndex.value = targetIndex
  // Restaurar snap (dejar que CSS tome control después de la animación)
  setTimeout(() => {
    if (galleryRef.value) {
      galleryRef.value.style.scrollSnapType = ''
      galleryRef.value.style.scrollBehavior = ''
    }
  }, 460)
}

const goToImage = (index: number) => {
  currentImageIndex.value = index

  // Scroll directo pero suave a la imagen específica
  if (galleryRef.value) {
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      // En mobile, calcular posición exacta
      const imageWidth = galleryRef.value.clientWidth * 0.85
      const gap = 24 // Gap entre imágenes
      const scrollPosition = index * (imageWidth + gap)

      galleryRef.value.scrollTo({
        left: scrollPosition,
        behavior: 'smooth' // Scroll suave para clicks directos
      })
    } else {
      // En desktop
      const imageWidth = 400
      const gap = 32 // Gap entre imágenes en desktop
      const scrollPosition = index * (imageWidth + gap)

      galleryRef.value.scrollTo({
        left: scrollPosition,
        behavior: 'smooth' // Scroll suave para clicks directos
      })
    }
  }
}

// Datos de los productos
const products = ref([
  {
    name: 'Pulsera Deportiva',
    image: '/images/ns200_slide1.jpg',
    description: 'Pulsera deportiva de alta calidad'
  },
  {
    name: 'Pulsera Premium',
    image: '/images/ns200_slide2.jpg',
    description: 'Edición premium con materiales especiales'
  },
  {
    name: 'Pulsera Clásica',
    image: '/images/ns200_slide3.jpg',
    description: 'Diseño clásico y elegante'
  }
])

const currentProductIndex = ref(0)
const currentProduct = ref(products.value[0])

// Funciones de navegación
const nextProduct = () => {
  currentProductIndex.value = (currentProductIndex.value + 1) % products.value.length
  currentProduct.value = products.value[currentProductIndex.value]
}

// const prevProduct = () => {
//   currentProductIndex.value = currentProductIndex.value === 0
//     ? products.value.length - 1
//     : currentProductIndex.value - 1
//   currentProduct.value = products.value[currentProductIndex.value]
// }

// const goToProduct = (index: number) => {
//   currentProductIndex.value = index
//   currentProduct.value = products.value[index]
// }

// Funciones de acción
const selectNumbers = () => {
  // Hacer scroll suave a la sección de selección de números
  const element = document.getElementById('number-selection')
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

const viewRules = () => {
  // Emitir evento para abrir modal de reglas
  emit('showRules')
}

// Nota: función de video eliminada por no uso

// Navegación con teclado
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    prevImage()
  } else if (event.key === 'ArrowRight') {
    nextImage()
  }
}

onMounted(() => {
  // Auto-rotación cada 5 segundos
  setInterval(() => {
    nextProduct()
  }, 5000)

  // Agregar listener para teclado
  window.addEventListener('keydown', handleKeydown)
  // Sincronizar posición de la sección de modificaciones con el scroll de la galería
  const syncModPosition = () => {
    const el = galleryRef.value
    const inner = motoInnerRef.value
    if (!el || !inner) return
  // Ajustar ancho del inner para que se mueva acorde a la galería (área visible)
  inner.style.width = `${el.clientWidth}px`
  // Trasladar inner negativamente la misma cantidad de scroll para que parezca que se mueve con la galería
  inner.style.transform = `translateX(${ -el.scrollLeft }px)`
  }

  // asignar listeners para limpieza posterior
  onGalleryScroll = () => syncModPosition()
  onResize = () => syncModPosition()

  if (galleryRef.value) galleryRef.value.addEventListener('scroll', onGalleryScroll)
  // Recalcular en resize para mantener alineación
  window.addEventListener('resize', onResize)
  // Ejecutar una vez para ajustar posición inicial
  setTimeout(syncModPosition, 50)
})

// Limpiar el listener cuando se desmonte el componente
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // Limpiar listener de scroll y resize
  if (galleryRef.value && onGalleryScroll) galleryRef.value.removeEventListener('scroll', onGalleryScroll)
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.hero-rifa {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Galería de fotos de la moto - Carousel */
.moto-gallery-section {
  position: relative;
  width: 100%;
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gallery-container {
  position: relative;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  text-align: center;
  overflow-x: visible;
}

.gallery-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.gallery-header h1 {
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.gallery-header .highlight-blue {
  color: #60a5fa;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.4);
}

/* Contenedor para centrar el contenido debajo de la galería */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.moto-modifications {
  /* Centrar y alinear con el contenido principal debajo de la galería */
  position:absolute;
  width: 100%;
  max-width: 1200px; /* igual que el content-wrapper */
  margin: 5rem auto 0 18rem; /* arriba separado, centrado */
  padding: 0.75rem 2rem; /* padding horizontal para alinear con el layout */
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  z-index: 1;
}

.modifications-description {
  font-size: 1rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

.highlight-text {
  color: #60a5fa;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
}

.video-link {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: 0.5rem;
}

.video-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

/* Galería horizontal */
.horizontal-gallery {
  display: flex;
  width: 100vw;
  margin: 0 0 2rem 0;
  margin-left: calc(-50vw + 50%);
  flex-wrap: nowrap;
  gap: 2rem;
  padding: 2rem;
  padding-bottom: 4.5rem; /* espacio extra para que el texto no quede encima de las fotos */
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth; /* Volvemos a smooth para que funcionen los swipes suaves */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  border-radius: 0;
  touch-action: pan-x; /* Mejorar gesto horizontal */
  overscroll-behavior-x: contain; /* Evitar rebote de la página */
}

/* Movimiento suave del inner que se sincroniza con el scroll */
.moto-modifications-inner {
  transition: transform 0.15s linear;
  will-change: transform;
}

/* Ocultar scrollbar en WebKit */
.horizontal-gallery::-webkit-scrollbar {
  display: none;
}

.gallery-image-item {
  flex: 0 0 400px; /* Ancho fijo para cada imagen */
  position: relative;
  cursor: pointer;
  transition: all 0.15s ease-out; /* Transición más rápida */
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(96, 165, 250, 0.3);
  background: #1e293b;
}

.gallery-image-item:hover {
  transform: translateY(-8px);
  z-index: 10;
  border-color: rgba(96, 165, 250, 0.8);
  box-shadow: 0 12px 35px rgba(96, 165, 250, 0.3);
}

.gallery-image-item.active {
  border-color: #60a5fa;
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-image-item:hover .image-wrapper img {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 41, 59, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);
}

.gallery-image-item:hover .image-overlay {
  opacity: 1;
}

.gallery-image-item.active .image-overlay {
  opacity: 0;
}

.image-info {
  text-align: center;
  color: #ffffff;
  padding: 1rem;
}

.image-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #60a5fa;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.image-info p {
  font-size: 0.9rem;
  margin: 0;
  color: #e2e8f0;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
}

/* Navegación con flechas a los lados */
.gallery-navigation {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 0;
  z-index: 20;
  pointer-events: none;
}

.gallery-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 2px solid rgba(96, 165, 250, 0.4);
  border-radius: 50%;
  color: #60a5fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  pointer-events: all;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.gallery-prev {
  left: 2rem;
}

.gallery-next {
  right: 2rem;
}

.gallery-nav-arrow:hover {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(30, 41, 59, 0.3) 100%);
  border-color: #60a5fa;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 0 25px rgba(96, 165, 250, 0.5);
  color: #ffffff;
}

.gallery-nav-arrow svg {
  width: 24px;
  height: 24px;
}

/* Botón agregar fotos */
.add-photos-section {
  text-align: center;
}

.add-photo-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
}

.add-photo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(6, 182, 212, 0.4);
}

.add-photo-btn svg {
  width: 20px;
  height: 20px;
}

/* Responsive para la galería horizontal */
@media (max-width: 1024px) {
  .horizontal-gallery {
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: 2rem 3rem;
  }

  .gallery-image-item {
    flex: 1 1 calc(50% - 0.75rem);
    min-width: calc(50% - 0.75rem);
  }

  .image-wrapper {
    height: 350px;
  }

  .gallery-header h1 {
    font-size: 3rem;
  }

  .gallery-nav-arrow {
    width: 50px;
    height: 50px;
  }

  .gallery-prev {
    left: 1rem;
  }

  .gallery-next {
    right: 1rem;
  }
}

@media (max-width: 768px) {
  .gallery-header h1 {
    font-size: 2.5rem;
  }

  .horizontal-gallery {
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 1.5rem;
    padding: 2rem 1rem;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory;
  }

  .gallery-image-item {
    flex: 0 0 85vw !important;
    min-width: 85vw !important;
    max-width: 85vw !important;
    scroll-snap-align: center;
  }

  .image-wrapper {
    height: 300px;
  }

  .moto-gallery-section {
    padding: 3rem 0;
  }

  .gallery-container {
    padding: 0;
  }

  .gallery-nav-arrow {
    width: 45px;
    height: 45px;
  }

  .gallery-nav-arrow svg {
    width: 20px;
    height: 20px;
  }

  .gallery-prev {
    left: 0.5rem;
  }

  .gallery-next {
    right: 0.5rem;
  }

  /* Responsive para modificaciones en tablet */
  .moto-modifications {
    /* En tablet quitar posicion absoluta y usar flujo normal */
    position: static !important;
    width: 100% !important;
    max-width: 1000px;
    padding: 0.6rem 1rem;
    margin: 2rem auto 0 auto; /* Cambio de -10.8rem a 2rem positivo */
  }

  .moto-modifications-inner {
    width: auto !important;
    transform: none !important;
    transition: none !important;
  }

  .modifications-description {
    font-size: 0.95rem;
  }

  .video-link {
    margin-left: 0.3rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.5rem;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .gallery-header h1 {
    font-size: 2rem;
    line-height: 1.2;
    padding: 0 1rem;
  }

  .horizontal-gallery {
    padding: 1rem 0.5rem;
    gap: 1rem;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory;
  }

  .gallery-image-item {
    flex: 0 0 90vw !important;
    min-width: 90vw !important;
    max-width: 90vw !important;
    scroll-snap-align: center;
  }

  .image-wrapper {
    height: 250px;
  }

  .moto-gallery-section {
    padding: 2rem 0;
  }

  .gallery-nav-arrow {
    width: 40px;
    height: 40px;
  }

  .gallery-nav-arrow svg {
    width: 18px;
    height: 18px;
  }

  .gallery-prev {
    left: 0.25rem;
  }

  .gallery-next {
    right: 0.25rem;
  }

  /* Responsive para modificaciones en móvil */
  .moto-modifications {
    /* En móviles pequeños: flujo normal, ancho contenido y botón en bloque */
    position: static !important;
    width: 100% !important;
    max-width: 92%;
    padding: 0.5rem 1rem;
    margin: -8rem auto 0 auto; /* Cambio de -10.8rem a 2rem positivo */
  }

  .moto-modifications-inner {
    width: auto !important;
    transform: none !important;
    transition: none !important;
  }

  .modifications-description {
    font-size: 0.8rem;
    line-height: 1.5;
  }

  .video-link {
    margin-left: 15rem;
    margin-top: -1.1rem;
    padding: 0.3rem 1rem;
    font-size: 0.4rem;
    display: block;
    text-align: center;

  }
}

/* Nueva sección de contenido debajo de la galería */
.content-section {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  backdrop-filter: blur(20px);
  padding: 4rem 0;
  margin: 2rem 0;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
  color: white;
}

/* Estilos específicos para el contenido */
.content-section .verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  margin-bottom: 2rem;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
}

.content-section .main-title h1 {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.content-section .highlight {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content-section .description {
  margin-bottom: 3rem;
}

.content-section .description p {
  font-size: 1.2rem;
  color: #cbd5e1;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.content-section .action-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.content-section .stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Ajustar el contenedor principal para dar espacio a la galería */
.hero-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Contenido izquierdo */
.hero-content {
  color: white;
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.verification-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
}

.verification-text {
  color: #22c55e;
}

.main-title {
  margin-bottom: 1.5rem;
}

.main-title h1 {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.highlight {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.description {
  margin: 0 auto 2rem auto;
  text-align: center;
}

.description p {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin: 0 auto 3rem auto;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 400px;
}

.btn-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(6, 182, 212, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.1);
  border-color: #94a3b8;
  color: white;
}

/* Controles de demo */
.demo-controls {
  display: flex;
  gap: 0.8rem;
  margin: 1rem auto 0 auto;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 600px;
}

.btn-demo {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-demo:hover {
  background: rgba(96, 165, 250, 0.2);
  border-color: #60a5fa;
  transform: translateY(-1px);
}

/* Estadísticas */
.stats-section {
  display: grid;
  /* 2 columnas para centrar las dos tarjetas en desktop */
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 0 auto 2rem auto;
  max-width: 800px;
  justify-content: center;
}

/* Clase especial para centrar una sola tarjeta */
.stats-centered {
  display: flex;
  justify-content: center;
  grid-template-columns: none;
}

.stat-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* Tip */
.tip-section {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.tip-section p {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

/* Producto lado derecho */
.hero-product {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.product-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.nav-btn {
  width: 50px;
  height: 50px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  transform: scale(1.1);
}

.nav-btn svg {
  width: 20px;
  height: 20px;
}

.product-showcase {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(51, 65, 85, 0.2) 100%);
  border: 1px solid rgba(51, 65, 85, 0.3);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(20px);
}

.product-label {
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.product-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.product-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
}

.product-image {
  position: relative;
  z-index: 2;
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

/* Indicadores */
.product-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(148, 163, 184, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  transform: scale(1.2);
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
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
  bottom: 20%;
  left: 5%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  top: 50%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }

  .main-title h1 {
    font-size: 2.5rem;
  }

  .stats-section {
  /* Mantener 2 columnas para que las tarjetas queden centradas */
  grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .hero-container {
    padding: 1rem;
    gap: 2rem;
  }

  .main-title h1 {
    font-size: 2rem;
  }

  .action-buttons {
    justify-content: center;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }

  .demo-controls {
    gap: 0.5rem;
    margin-top: 0.8rem;
  }

  .btn-demo {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .main-title h1 {
    font-size: 1.8rem;
  }

  .description p {
    font-size: 1rem;
  }

  .product-showcase {
    padding: 1rem;
  }

  .product-image-container {
    min-height: 200px;
  }

  .gallery-navigation{
    top: 30%;
  }
}

/* Estilos responsivos para la sección de contenido */
@media (max-width: 1024px) {
  .content-section .main-title h1 {
    font-size: 3.5rem;
  }

  .content-section .action-buttons {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .content-section {
    padding: 3rem 0;
    margin: 1rem;
    border-radius: 16px;
  }

  .content-container {
    padding: 0 1rem;
  }

  .content-section .main-title h1 {
    font-size: 2.5rem;
  }

  .content-section .description p {
    font-size: 1.1rem;
  }

  .content-section .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .content-section .stats-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 2rem 0;
    margin: 0.5rem;
  }

  .content-section .main-title h1 {
    font-size: 2rem;
  }

  .content-section .description p {
    font-size: 1rem;
  }

  .content-section .verification-badge {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
