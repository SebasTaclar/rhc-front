<template>
  <section class="news-section">
    <div class="container">
      <div class="section-header">
        <div class="header-content">
          <h2>Flash Tributario</h2>
          <p class="subtitle">
            Mantente actualizado con las últimas noticias y cambios normativos en materia tributaria
          </p>
        </div>
        <div class="header-badge">
          <span class="flash-badge">⚡ ACTUALIZADO</span>
        </div>
      </div>

      <div class="news-grid">
        <article
          v-for="news in newsItems"
          :key="news.id"
          class="news-card"
          :class="{ 'featured': news.featured }"
        >
          <div class="news-image">
            <div class="news-category" :style="{ backgroundColor: news.categoryColor }">
              {{ news.category }}
            </div>
            <div class="news-date">
              {{ formatDate(news.date) }}
            </div>
            <div class="flash-overlay">
              <span class="flash-text">Flash</span>
            </div>
          </div>

          <div class="news-content">
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-description">{{ news.description }}</p>

            <div class="news-meta">
              <span class="news-source">{{ news.source }}</span>
              <span class="reading-time">{{ news.readingTime }} min lectura</span>
            </div>

            <button class="read-more-btn" @click="openNewsModal(news)">
              Leer más <span class="arrow">→</span>
            </button>
          </div>
        </article>
      </div>

      <div class="news-footer">
        <button class="load-more-btn">
          Ver más noticias
        </button>
        <div class="newsletter-cta">
          <h4>¿Quieres recibir actualizaciones?</h4>
          <p>Suscríbete a nuestro newsletter tributario</p>
          <button class="subscribe-btn" @click="scrollToContact">
            Suscribirme
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para mostrar noticia completa -->
    <Transition name="modal">
      <div v-if="showNewsModal" class="modal-overlay" @click="closeNewsModal">
        <div class="modal-content news-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-news-category" :style="{ backgroundColor: selectedNews?.categoryColor }">
              {{ selectedNews?.category }}
            </div>
            <button @click="closeNewsModal" class="close-button">&times;</button>
          </div>

          <div class="modal-body">
            <div class="modal-news-date">{{ formatDate(selectedNews?.date) }}</div>
            <h3 class="modal-news-title">{{ selectedNews?.title }}</h3>
            <div class="modal-news-meta">
              <span class="modal-news-source">{{ selectedNews?.source }}</span>
              <span class="modal-reading-time">{{ selectedNews?.readingTime }} min lectura</span>
            </div>
            <div class="modal-news-content">
              <p>{{ selectedNews?.fullContent }}</p>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="scrollToContact; closeNewsModal()" class="btn btn-primary">
              Necesito asesoría sobre esto
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NewsItem {
  id: string
  title: string
  description: string
  fullContent: string
  date: string
  category: string
  categoryColor: string
  source: string
  readingTime: number
  featured?: boolean
}

// Modal state
const showNewsModal = ref(false)
const selectedNews = ref<NewsItem | null>(null)

const newsItems = ref<NewsItem[]>([
  {
    id: '1',
    title: 'Validez del extracto bancario como documento soporte sin requerir DSNO',
    description: 'La DIAN expidió la Resolución 000227 del 23 de septiembre de 2025, estableciendo nuevos lineamientos para la validación de documentos.',
    fullContent: 'La Dirección de Impuestos y Aduanas Nacionales (DIAN) mediante la Resolución 000227 del 23 de septiembre de 2025, estableció que los extractos bancarios pueden ser utilizados como documento soporte válido para efectos tributarios sin necesidad de presentar la Declaración de Saldos de Nómina y Otros (DSNO). Esta medida busca simplificar los procesos administrativos y reducir la carga documental para los contribuyentes. La resolución entrará en vigor a partir del 1 de noviembre de 2025 y aplicará para todas las transacciones realizadas a partir de esa fecha.',
    date: '2025-10-07',
    category: 'Normativa',
    categoryColor: '#3b82f6',
    source: 'DIAN',
    readingTime: 3,
    featured: true
  },
  {
    id: '2',
    title: 'Resolución Única en Materia Tributaria, Aduanera y Cambiaria',
    description: 'Nueva resolución unificada que simplifica los procesos tributarios y aduaneros para empresas colombianas.',
    fullContent: 'El Ministerio de Hacienda anunció la implementación de la Resolución Única en Materia Tributaria, Aduanera y Cambiaria, que entrará en vigor el próximo año. Esta resolución busca unificar y simplificar los procesos relacionados con obligaciones tributarias, operaciones aduaneras y controles cambiarios. Los principales beneficios incluyen: reducción de trámites duplicados, plataforma digital única, y tiempos de respuesta más cortos. Las empresas tendrán un período de transición de 6 meses para adaptarse a los nuevos procedimientos.',
    date: '2025-09-30',
    category: 'Regulación',
    categoryColor: '#10b981',
    source: 'MinHacienda',
    readingTime: 4
  },
  {
    id: '3',
    title: 'Supersociedades emite lineamientos para reporte de ESAL extranjeras',
    description: 'La Superintendencia de Sociedades aclaró la aplicación del Régimen de Medidas Mínimas para las entidades sin ánimo de lucro.',
    fullContent: 'La Superintendencia de Sociedades emitió nuevos lineamientos para el reporte de Entidades Sin Ánimo de Lucro (ESAL) extranjeras que operen en Colombia. Las nuevas medidas incluyen: registro obligatorio en el RNPJ, presentación de informes financieros anuales, y cumplimiento de estándares internacionales de transparencia. Las ESAL extranjeras tendrán hasta el 31 de marzo de 2026 para cumplir con estos nuevos requisitos. La medida busca fortalecer la supervisión y prevenir el lavado de activos en este sector.',
    date: '2025-09-29',
    category: 'Supervisión',
    categoryColor: '#f59e0b',
    source: 'Supersociedades',
    readingTime: 5
  },
  {
    id: '4',
    title: 'Nuevas medidas para el control cambiario en operaciones internacionales',
    description: 'El Banco de la República estableció nuevos controles para las operaciones de cambio internacional.',
    fullContent: 'El Banco de la República anunció nuevas medidas de control cambiario que entrarán en vigor el 1 de enero de 2026. Las principales modificaciones incluyen: límites actualizados para operaciones sin reporte, nuevos formularios digitales para declaración de cambios, y mayor supervisión en operaciones de comercio exterior. Estas medidas buscan fortalecer el control sobre las operaciones cambiarias y mejorar la información estadística del país.',
    date: '2025-09-25',
    category: 'Cambiario',
    categoryColor: '#ef4444',
    source: 'Banco República',
    readingTime: 4
  },
  {
    id: '5',
    title: 'Reforma al régimen simple de tributación para pequeñas empresas',
    description: 'Se amplían los beneficios del régimen simple para PYMES con nuevos topes de ingresos y deducciones.',
    fullContent: 'El Congreso aprobó modificaciones al Régimen Simple de Tributación (SIMPLE) que beneficiarán a las pequeñas y medianas empresas. Los cambios incluyen: aumento del tope de ingresos de $3.500 millones a $5.000 millones anuales, nuevas deducciones por inversión en tecnología, y simplificación en la liquidación del impuesto. La reforma entrará en vigor para el año gravable 2026 y se estima que beneficiará a más de 150.000 empresas en todo el país.',
    date: '2025-09-20',
    category: 'Reforma',
    categoryColor: '#8b5cf6',
    source: 'Congreso',
    readingTime: 6
  },

])

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const openNewsModal = (news: NewsItem) => {
  selectedNews.value = news
  showNewsModal.value = true
}

const closeNewsModal = () => {
  showNewsModal.value = false
  selectedNews.value = null
}

const scrollToContact = () => {
  const contactSection = document.getElementById('contacto')
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.news-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  gap: 2rem;
}

.header-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.125rem;
  color: #64748b;
  max-width: 600px;
  line-height: 1.6;
}

.header-badge {
  flex-shrink: 0;
}

.flash-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.25);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.news-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
}

.news-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.news-card.featured {
  grid-column: span 2;
}

.news-image {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-category {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.news-date {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.flash-overlay {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.news-content {
  padding: 1.5rem;
}

.news-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.news-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.news-source {
  color: #3b82f6;
  font-weight: 600;
}

.reading-time {
  color: #64748b;
}

.read-more-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
}

.read-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(102, 126, 234, 0.4);
}

.arrow {
  transition: transform 0.2s;
}

.read-more-btn:hover .arrow {
  transform: translateX(4px);
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
  border-top: 1px solid #e2e8f0;
  gap: 2rem;
}

.load-more-btn {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #667eea;
  color: white;
}

.newsletter-cta {
  text-align: right;
}

.newsletter-cta h4 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.newsletter-cta p {
  color: #64748b;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.subscribe-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.subscribe-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.news-modal {
  min-width: 600px;
  max-width: 90vw;
  max-height: 80vh;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-news-category {
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 1;
}

.modal-body {
  padding: 2rem;
  max-height: 400px;
  overflow-y: auto;
}

.modal-news-date {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.modal-news-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.modal-news-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.modal-news-source {
  color: #3b82f6;
  font-weight: 600;
}

.modal-reading-time {
  color: #64748b;
}

.modal-news-content {
  color: #374151;
  line-height: 1.7;
  font-size: 1rem;
}

.modal-footer {
  padding: 1rem 2rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Modal transitions */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive design */
@media (max-width: 1024px) {
  .news-card.featured {
    grid-column: span 1;
  }

  .news-footer {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .newsletter-cta {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    text-align: center;
  }

  .header-content h2 {
    font-size: 2rem;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .news-modal {
    min-width: 320px;
    margin: 1rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .news-section {
    padding: 3rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .news-content {
    padding: 1rem;
  }

  .header-content h2 {
    font-size: 1.75rem;
  }
}
</style>
