<template>
  <section class="services-section" aria-label="Servicios">
    <div class="container">
      <header class="services-header">
        <h2>Servicios</h2>
        <p>Soluciones completas para tu contabilidad, con enfoque práctico y resultados medibles.</p>
      </header>

      <div class="cards">
        <article class="card">
          <div class="icon">+</div>
          <h3>Asesoría contable</h3>
          <p>Acompañamiento continuo para ordenar tus finanzas y mejorar la toma de decisiones.</p>
          <a class="link" href="#contacto">Solicitar información</a>
        </article>

        <article class="card">
          <div class="icon">%</div>
          <h3>Declaración de impuestos</h3>
          <p>Cumplimiento fiscal sin sorpresas, con planeación para optimizar tus obligaciones.</p>
          <a class="link" href="#contacto">Solicitar información</a>
        </article>

        <article class="card">
          <div class="icon">🔍</div>
          <h3>Auditorías</h3>
          <p>Revisiones integrales para asegurar exactitud y transparencia en tus informes.</p>
          <a class="link" href="#contacto">Solicitar información</a>
        </article>

        <article class="card">
          <div class="icon">≡</div>
          <h3>Gestión de nómina</h3>
          <p>Procesos confiables para pagos puntuales, prestaciones y cumplimiento laboral.</p>
          <a class="link" href="#contacto">Solicitar información</a>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Estático por ahora; se puede convertir a dinámico con props/slot
</script>

<style scoped>
.services-section {
  background: linear-gradient(180deg, #f7fafc 0%, #eef6fb 100%);
  padding: 56px 0 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 6%;
}

.services-header {
  text-align: center;
  margin-bottom: 28px;
}

.services-header h2 {
  font-size: 28px;
  margin-bottom: 8px;
  color: #0b254e;
}

.services-header p {
  color: #6b7280;
  margin: 0 auto;
  max-width: 700px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 18px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(2,6,23,0.06);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon {
  width: 44px;
  height: 44px;
  background: #123b8a;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.card h3 {
  margin: 0;
  font-size: 16px;
  color: #0b254e;
}

.card p { color: #6b7280; font-size: 13px; margin: 0; flex: 1; }

.link { color: #0b3a99; font-weight: 600; margin-top: 6px; text-decoration: none; }

@media (max-width: 992px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .cards { grid-template-columns: 1fr; }
}
</style>
