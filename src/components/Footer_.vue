<template>
  <footer class="modern-footer">
    <!-- Sección principal del footer -->
    <div class="footer-main">
      <div class="footer-container">
        <!-- Contenido con logo a la izquierda y contacto a la derecha -->
        <div class="footer-content">
          <!-- Logo y descripción -->
          <div class="brand-section">
            <h2 class="brand-title">DigitalWallpapers<span class="highlight">Moto</span></h2>
            <p class="brand-description">
              Tu oportunidad de comprar tus fondos digitales.
            </p>
          </div>

          <!-- Información de contacto -->
          <div class="contact-section">
            <h3 class="section-title">Contacto</h3>
            <div class="contact-info">
              <div class="contact-item">
                <div class="contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <div class="contact-text">
                  <span>Teléfono</span>
                  <p>+57 311 8715539</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra inferior -->
    <div class="footer-bottom">
      <div class="footer-container">
        <div class="copyright-section">
          <p>&copy; 2025 DigitalWallpapersMoto. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>

    <!-- Elementos decorativos -->
    <div class="footer-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
  </footer>
</template>

<style scoped>
.modern-footer {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  color: #ffffff;
  overflow: hidden;
}

.footer-main {
  padding: 4rem 0 2rem;
  position: relative;
  z-index: 2;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4rem;
}

/* Sección de marca a la izquierda */
.brand-section {
  flex: 1;
  max-width: 500px;
}

.brand-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #ffffff;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.brand-title .highlight {
  color: #60a5fa;
  text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
}

.brand-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin: 0;
}

/* Sección de contacto a la derecha */
.contact-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #60a5fa;
  margin: 0;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
  border-radius: 2px;
}

.contact-info {
  display: flex;
  justify-content: flex-end;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contact-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
}

.contact-icon svg {
  width: 22px;
  height: 22px;
  color: #ffffff;
}

.contact-text span {
  font-size: 0.9rem;
  color: #60a5fa;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
}

.contact-text p {
  margin: 0.4rem 0 0 0;
  color: #e2e8f0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Barra inferior */
.footer-bottom {
  background: rgba(15, 23, 42, 0.8);
  border-top: 1px solid rgba(96, 165, 250, 0.2);
  padding: 1.5rem 0;
  position: relative;
  z-index: 2;
}

/* Sección del copyright */
.copyright-section {
  text-align: center;
}

.copyright-section p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Elementos decorativos */
.footer-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 4s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }

  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-main {
    padding: 3rem 0 2rem;
  }

  .footer-container {
    padding: 0 1rem;
  }

  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 2.5rem;
  }

  .contact-section {
    align-items: center;
    text-align: center;
  }

  .section-title::after {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  .contact-info {
    justify-content: center;
  }

  .brand-title {
    font-size: 2.5rem;
  }

  .brand-description {
    font-size: 1rem;
  }

  .contact-item {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }
}@media (max-width: 480px) {
  .footer-main {
    padding: 2rem 0 1.5rem;
  }

  .footer-container {
    padding: 0 1rem;
  }

  .brand-title {
    font-size: 2rem;
  }

  .brand-description {
    font-size: 0.95rem;
  }

  .contact-icon {
    width: 40px;
    height: 40px;
  }

  .contact-icon svg {
    width: 18px;
    height: 18px;
  }

  .decoration-circle {
    display: none;
  }
}
</style>
