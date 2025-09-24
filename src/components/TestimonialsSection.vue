<template>
  <section class="testimonials" aria-label="Testimonios">
    <div class="container">
      <header class="head">
        <h2>Testimonios</h2>
        <p class="subtitle">Lo que nuestros clientes dicen de nosotros.</p>
      </header>

      <div class="cards">
        <article class="tcard" v-for="(t, i) in testimonials" :key="i">
          <div class="meta">
            <div class="avatar">{{ t.initials }}</div>
            <div class="who">
              <strong>{{ t.name }}</strong>
              <span class="role">{{ t.role }}</span>
            </div>
          </div>
          <blockquote class="quote">“{{ t.quote }}”</blockquote>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const testimonials = ref([
  { initials: 'AG', name: 'Andrea Gómez', role: 'Directora, Café Aurora', quote: 'Profesionales, rápidos y muy claros. Mejoramos nuestro flujo de caja y logramos orden financiero en semanas.' },
  { initials: 'RM', name: 'Ricardo Montes', role: 'CEO, LogisTech', quote: 'Su apoyo en impuestos nos ahorró tiempo y costos. Totalmente recomendados.' },
  { initials: 'SP', name: 'Sara Pérez', role: 'Fundadora, EduKids', quote: 'La auditoría fue clara y accionable. Nos dio seguridad ante inversionistas.' }
])
</script>

<style scoped>
.testimonials { padding: 56px 0; background: linear-gradient(180deg, #f7fafc 0%, #eef6fb 100%); }
.container { max-width: 1200px; margin: 0 auto; padding: 0 6%; }
.head { text-align: center; margin-bottom: 28px; }
.head h2 { font-size: 24px; color: #0b254e; margin-bottom: 6px; }
.head p { color: #6b7280; margin: 0; }

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.tcard { background: white; border-radius: 10px; padding: 18px; box-shadow: 0 8px 24px rgba(2,6,23,0.06); }
.meta { display:flex; gap: 12px; align-items:center; margin-bottom: 8px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #e6eefb; color:#0b3a99; display:flex; align-items:center; justify-content:center; font-weight:700; }
.who strong { font-size: 14px; color: #0b254e; display:block; }
.role { font-size: 12px; color: #9aa6be; }
.quote { color: #374151; font-size: 14px; margin: 8px 0 0 0; line-height:1.5; }

@media (max-width: 992px) { .cards { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 640px) { .cards { grid-template-columns: 1fr; } }
</style>
