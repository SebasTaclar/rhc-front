<template>
  <section class="cta-section">
    <div class="cta-container">
      <div class="cta-content">
        <h3>¿Listo para llevar tus finanzas al siguiente nivel?</h3>
        <p>Agenda una consulta y obtén un diagnóstico sin costo.</p>
      </div>
      <div class="cta-action">
        <a class="cta-btn" href="#contacto">Solicitar Asesoría
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M10 17l5-5-5-5v10z" fill="currentColor"/>
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// simple presentational CTA
</script>

<style scoped>
.cta-section { background: transparent; display: flex; justify-content: center; padding: 28px 0; }
.cta-container { width: 100%; max-width: 1100px; background: linear-gradient(90deg,#1e40af,#1e3a8a); color:white; padding:18px 28px; border-radius:10px; display:flex; align-items:center; justify-content:space-between; box-shadow: 0 10px 30px rgba(2,6,23,0.06); }
.cta-content h3 { margin:0; font-size:18px; font-weight:700 }
.cta-content p { margin:4px 0 0 0; font-size:13px; opacity:0.95 }
.cta-action { margin-left: 20px }
.cta-btn { background: white; color: #0b3a99; padding:10px 14px; border-radius:8px; text-decoration:none; display:inline-flex; gap:8px; align-items:center; font-weight:600 }
.cta-btn svg { transform: translateX(2px) }

@media (max-width: 720px) {
  .cta-container { flex-direction: column; gap:10px; align-items:stretch }
  .cta-action { display:flex; justify-content:flex-end }
}
</style>
