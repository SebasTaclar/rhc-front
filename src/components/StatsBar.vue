<template>
  <section class="stats-bar" aria-label="Estadísticas principales">
    <div class="stats-container">
      <div class="stat">
        <div class="value">15+</div>
        <div class="label">Años de experiencia</div>
      </div>
      <div class="stat">
        <div class="value">500+</div>
        <div class="label">Empresas asesoradas</div>
      </div>
      <div class="stat">
        <div class="value">98%</div>
        <div class="label">Clientes satisfechos</div>
      </div>
      <div class="stat">
        <div class="value">24/7</div>
        <div class="label">Soporte disponible</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Componente estático; si quieres datos dinámicos podemos pasar props o consumir API
</script>

<style scoped>
.stats-bar {
  background: linear-gradient(180deg, #153f86 0%, #133774 100%);
  color: white;
  padding: 28px 0;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  justify-content: space-around;
  align-items: center;
  padding: 0 6%;
}

.stat {
  text-align: center;
}

.value {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 6px;
}

.label {
  font-size: 12px;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
    gap: 14px;
  }

  .value { font-size: 22px; }
}
</style>
