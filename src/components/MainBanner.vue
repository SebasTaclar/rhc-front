<template>
  <!-- Hero principal RHC Asesorías -->
  <section class="hero">
    <div class="hero-text">
      <span class="tag">+ Crece con confianza</span>
      <h1>Tu aliado en finanzas, contabilidad y tributaria</h1>
      <p>En RHC Asesorías te ayudamos a optimizar tu contabilidad, reducir riesgos y tomar mejores decisiones con información clara y oportuna.</p>

      <div class="buttons">
        <button class="btn-primary">Consulta GRATIS →</button>
        <button class="btn-secondary">Ver servicios →</button>
      </div>

      <p class="offer">⏳ Oferta limitada: Primera consulta SIN COSTO · Solo este mes</p>

      <div class="benefits">
        <span>Contador público certificado</span>
        <span>Respaldo legal completo</span>
      </div>
    </div>

    <div class="hero-image">
      <div class="chart-card" role="img" aria-label="Gráfica de rentabilidad">
        <svg class="chart-svg" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#1e40af" />
              <stop offset="100%" stop-color="#60a5fa" />
            </linearGradient>
            <linearGradient id="topGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="1" />
              <stop offset="100%" stop-color="#93c5fd" stop-opacity="1" />
            </linearGradient>
          </defs>

          <!-- barras: x, width, height (target) -->
          <g class="bars">
            <g class="bar-group" transform="translate(0,0)">
              <rect class="bar-bg" x="40" width="28" height="220" rx="6" />
              <rect class="bar-top" x="40" width="28" height="220" data-height="60" rx="6" />
            </g>
            <g class="bar-group" transform="translate(0,0)">
              <rect class="bar-bg" x="110" width="28" height="220" rx="6" />
              <rect class="bar-top" x="110" width="28" height="220" data-height="110" rx="6" />
            </g>
            <g class="bar-group" transform="translate(0,0)">
              <rect class="bar-bg" x="180" width="28" height="220" rx="6" />
              <rect class="bar-top" x="180" width="28" height="220" data-height="150" rx="6" />
            </g>
            <g class="bar-group" transform="translate(0,0)">
              <rect class="bar-bg" x="250" width="28" height="220" rx="6" />
              <rect class="bar-top" x="250" width="28" height="220" data-height="190" rx="6" />
            </g>
            <g class="bar-group" transform="translate(0,0)">
              <rect class="bar-bg" x="320" width="28" height="220" rx="6" />
              <rect class="bar-top" x="320" width="28" height="220" data-height="220" rx="6" />
            </g>
            <g class="bar-group" transform="translate(0,0)">
              <rect class="bar-bg" x="390" width="28" height="220" rx="6" />
              <rect class="bar-top" x="390" width="28" height="220" data-height="250" rx="6" />
            </g>
          </g>

          <!-- línea de tendencia (suavizada) -->
          <path class="trend" d="" fill="none" stroke="#0b61d6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <div class="legend-card" aria-hidden="false">
          <div class="legend-lines">
            <span class="line short"></span>
            <span class="line medium"></span>
            <span class="line long"></span>
          </div>
        </div>

        <div class="dollar">$</div>
      </div>

      <div class="floating-card">
        <div class="card-icon">+</div>
        <div class="card-content">
          <strong>Rentabilidad +</strong>
          <span>Optimiza costos y tiempo</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
   .hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4rem 8%;
      flex-wrap: wrap;
    }

    .hero-text {
      max-width: 550px;
    }

    .tag {
      display: inline-block;
      background: #f3f4f6;
      color: #1e3a8a;
      font-size: 0.9rem;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 999px;
      margin-bottom: 1rem;
    }

    .hero-text h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      color: #111827;
    }

    .hero-text p {
      font-size: 1.1rem;
      color: #4b5563;
      margin-bottom: 2rem;
    }

    .buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .btn-primary {
      background: #1e3a8a;
      color: white;
      font-weight: 600;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .btn-primary:hover {
      background: #243da0;
    }

    .btn-secondary {
      background: white;
      color: #111827;
      font-weight: 500;
      padding: 12px 20px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #f3f4f6;
    }

    .offer {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 1rem 0;
    }

    .benefits {
      display: flex;
      gap: 2rem;
      font-size: 0.95rem;
      color: #111827;
    }

    .benefits span::before {
      content: "✔ ";
      color: #1e3a8a;
      font-weight: bold;
    }

    /* Hero gráfico */
    .hero-image {
      position: relative;
      max-width: 700px;
      min-width: 500px;
      background: #f8fafc;
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      display: flex;
      justify-content: center;
      align-items: flex-end;
      /* allow floating elements to overflow the card */
      overflow: visible;
    }

    .chart-card {
      width: 100%;
      max-width: 560px;
      background: white;
      border-radius: 12px;
      padding: 28px 20px 36px 20px;
      box-shadow: none;
      display: block;
      position: relative;
      height: 260px;
      overflow: visible;
    }

    .chart-svg {
      width: 100%;
      height: 100%;
      display: block;
      background: linear-gradient(180deg, #ffffff 0%, #f1f9ff 100%);
      border-radius: 8px;
      padding: 12px;
    }

    .bar-group .bar-bg {
      fill: #eef8ff;
    }

    .bar-group .bar-top {
      fill: url(#topGrad);
      transform-origin: bottom;
      transform: translateY(220px);
      transition: transform 900ms cubic-bezier(.2,.9,.2,1);
    }

    .trend {
      stroke: #0b61d6;
      stroke-dasharray: 800;
      stroke-dashoffset: 800;
      transition: stroke-dashoffset 1000ms ease-in-out 300ms;
      fill: none;
    }

    .legend-card {
      position: absolute;
      top: 18px;
      right: 18px;
      background: rgba(255,255,255,0.9);
      padding: 12px 14px;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(2,6,23,0.06);
      width: 90px;
    }

    .legend-lines .line {
      display: block;
      height: 6px;
      border-radius: 6px;
      margin: 6px 0;
      background: linear-gradient(90deg, #0b61d6, #60a5fa);
    }

    .legend-lines .short { width: 36px; }
    .legend-lines .medium { width: 58px; }
    .legend-lines .long { width: 76px; }

    .dollar {
      position: absolute;
      bottom: 18px;
      right: 18px;
      background: #0b61d6;
      color: white;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;
      box-shadow: 0 6px 14px rgba(11,97,214,0.14);
      z-index: 20;
    }

    .floating-card {
      position: absolute;
      bottom: -22px; /* slightly higher so not too clipped */
      left: 22px; /* a little inset from left */
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(2,6,23,0.08);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 30; /* high so it sits above other elements */
      min-width: 240px;
    }

    .card-icon {
      width: 36px;
      height: 36px;
      background: #0b61d6;
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .card-content strong { color: #0b3a99; font-size: 1rem; }
    .card-content span { color: #64748b; font-size: 0.85rem; }
</style>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const svg = document.querySelector('.chart-svg') as SVGSVGElement | null;
  if (!svg) return;

  const bars = Array.from(svg.querySelectorAll<SVGRectElement>('.bar-top'));

  // SVG coordinate system: viewBox 0 0 600 300; bars have height attribute as placeholder
  const paddingBottom = 40;

  // Animate bars by scaling Y from 0 to target
  bars.forEach((bar, i) => {
    const dh = Number(bar.getAttribute('data-height') || '0');
    const max = 260;
    const h = Math.max(6, Math.min(220, (dh / max) * 220));
    const translate = 220 - h; // amount to move down from top
    setTimeout(() => {
      bar.style.transform = `translateY(${translate}px)`;
      // staggered delay via transitionDelay
  (bar.style as unknown as CSSStyleDeclaration).transitionDelay = `${i * 90}ms`;
    }, 120 + i * 120);
  });

  // Build trend polyline points from centers of bars
  const trend = svg.querySelector<SVGPathElement>('.trend');
  if (trend && bars.length) {
    // compute centers and y positions
    const pts: Array<[number, number]> = [];
    bars.forEach((bar) => {
      const x = Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')) / 2;
      const dh = Number(bar.getAttribute('data-height') || '0');
      const max = 260;
      const yArea = 200;
      const y = paddingBottom + (1 - Math.min(1, dh / max)) * yArea;
      pts.push([x, y]);
    });

    // Catmull-Rom to Bezier helper
    function catmullRom2bezier(points: Array<[number, number]>) {
      const d = [] as string[];
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = i === 0 ? points[i] : points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i + 2 < points.length ? points[i + 2] : p2;
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        if (i === 0) {
          d.push(`M ${p1[0]},${p1[1]}`);
        }
        d.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
      }
      return d.join(' ');
    }

    const pathD = catmullRom2bezier(pts);
    trend.setAttribute('d', pathD);
    setTimeout(() => {
      trend.style.strokeDashoffset = '0';
    }, 420);
  }
});
</script>
