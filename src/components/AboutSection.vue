<template>
  <section class="about-section">
    <div class="container">
      <div class="columns">
        <div class="col-text">
          <h2>Nosotros</h2>
          <p class="lead">Somos un equipo de contadores y consultores con amplia experiencia en pymes y empresas en crecimiento. Nuestro enfoque combina precisión técnica con una comunicación clara para que tomes decisiones con seguridad.</p>

          <ul class="features">
            <li>Equipo certificado y actualizado</li>
            <li>Metodologías ágiles y confiables</li>
            <li>Acompañamiento estratégico de principio a fin</li>
          </ul>

          <div class="actions">
            <button class="btn-primary">Hablemos</button>
            <button class="btn-outline">Ver testimonios</button>
          </div>
        </div>

        <div class="col-cards">
          <div class="team-card">
            <div class="pill">+120 empresas asesoradas</div>
            <div class="cards-wrap">
              <div class="person">
                <div class="avatar">👩</div>
                <div class="info"><strong>María</strong><span>Senior Contadora</span></div>
              </div>
              <div class="person">
                <div class="avatar">👨</div>
                <div class="info"><strong>Javier</strong><span>Auditor Líder</span></div>
              </div>
              <div class="person">
                <div class="avatar">👩</div>
                <div class="info"><strong>Laura</strong><span>Especialista en Nómina</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="partners">
        <h4>Certificaciones y aliados de confianza</h4>
        <div class="logos">
          <div class="logo">DIAN</div>
          <div class="logo">CPC</div>
          <div class="logo">ISO 9001</div>
          <div class="logo">NIIF</div>
          <div class="logo">Supersociedades</div>
          <div class="logo">Cámara de Comercio</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Estático por ahora
</script>

<style scoped>
.about-section { padding: 56px 0; background: white; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 6%; }
.columns { display: flex; gap: 36px; align-items: flex-start; }
.col-text { flex: 1; max-width: 540px; }
.col-cards { width: 420px; }

.col-text h2 { font-size: 24px; color: #0b254e; }
.lead { color: #6b7280; margin-top: 8px; max-width: 520px; }
.features { margin-top: 18px; list-style: none; padding: 0; }
.features li { margin: 10px 0; padding-left: 18px; position: relative; color: #374151; }
.features li::before { content: '✔'; position: absolute; left: -10px; color: #0b61d6; background: #e6f0ff; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px; }

.actions { margin-top: 20px; display:flex; gap: 12px; }
.btn-primary { background: #0b3a99; color: white; padding: 10px 16px; border-radius: 10px; border: none; }
.btn-outline { background: white; border: 1px solid #d1d5db; color: #0b254e; padding: 10px 16px; border-radius: 10px; }

.team-card { background: linear-gradient(180deg,#2f5ea1 0%,#6fb0f1 100%); border-radius: 12px; padding: 20px; color: white; position: relative; box-shadow: 0 12px 30px rgba(17,45,90,0.08); }
.pill { position: absolute; bottom: -14px; right: 18px; background: white; color: #0b254e; padding: 8px 12px; border-radius: 10px; font-weight: 600; box-shadow: 0 8px 20px rgba(2,6,23,0.06); }
.cards-wrap { display:flex; gap: 14px; }
.person { background: rgba(255,255,255,0.85); border-radius: 8px; padding: 18px; width: 120px; text-align: center; color: #0b254e; }
.avatar { background: rgba(11,61,153,0.08); width: 54px; height: 54px; border-radius: 50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 8px auto; }
.person .info strong { display:block; }
.person .info span { font-size: 12px; color: #6b7280; }

.partners { margin-top: 48px; text-align: center; }
.partners h4 { color: #0b254e; margin-bottom: 18px; }
.logos { display:flex; gap: 26px; justify-content:center; flex-wrap:wrap; }
.logo { background: #f3f6f9; padding: 18px; border-radius: 8px; color: #9aa6be; min-width: 90px; text-align:center; }

@media (max-width: 960px) {
  .columns { flex-direction: column; }
  .col-cards { width: 100%; }
  .pill { position: relative; bottom: auto; right: auto; margin-top: 12px; }
}
</style>
