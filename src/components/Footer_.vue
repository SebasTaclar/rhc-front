<template>
  <footer class="rhc-footer">
    <!-- Sección principal del footer -->
    <div class="footer-main">
      <div class="footer-container">
        <div class="footer-content">
          <!-- Logo y descripción -->
          <div class="brand-section">
            <div class="logo">
              <div class="logo-image">
                <img src="/images/logo.jpeg" alt="RHC Asesorías Logo" />
              </div>
              <span class="logo-text">RHC Asesorías</span>
            </div>
            <p class="brand-description">
              Finanzas, contabilidad y tributaria para empresas que buscan crecer con orden.
            </p>
            <!-- Redes sociales -->
            <div class="social-links">
              <a href="#" class="social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Columnas de navegación -->
          <div class="footer-columns">
            <!-- Links -->
            <div class="footer-column">
              <h3 class="column-title">Links</h3>
              <ul class="column-links">
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#servicios">Servicios</a></li>
                <li><a href="#nosotros">Nosotros</a></li>
                <li><a href="#testimonios">Testimonios</a></li>
                <li><a href="#contacto">Contacto</a></li>
              </ul>
            </div>

            <!-- Servicios -->
            <div class="footer-column">
              <h3 class="column-title">Servicios</h3>
              <ul class="column-links">
                <li><a href="#asesoria-contable">Asesoría contable</a></li>
                <li><a href="#declaracion-impuestos">Declaración de impuestos</a></li>
                <li><a href="#auditorias">Auditorías</a></li>
                <li><a href="#gestion-nomina">Gestión de nómina</a></li>
              </ul>
            </div>

            <!-- Legal -->
            <div class="footer-column">
              <h3 class="column-title">Legal</h3>
              <ul class="column-links">
                <li><a href="#terminos">Términos</a></li>
                <li><a href="#privacidad">Privacidad</a></li>
                <li><a href="#cookies">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra inferior -->
    <div class="footer-bottom">
      <div class="footer-container">
        <div class="bottom-content">
          <p class="copyright">&copy; 2025 RHC Asesorías. Todos los derechos reservados.</p>
          <p class="dedication">Hecho con dedicación para tu crecimiento</p>
        </div>
      </div>
    </div>

    <!-- Botón de WhatsApp flotante -->
    <a href="https://wa.me/573118715539" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
      </svg>
    </a>
  </footer>
</template>

<style scoped>
.rhc-footer {
  background-color: #1e293b;
  color: #ffffff;
  position: relative;
}

.footer-main {
  padding: 3rem 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  align-items: start;
}

/* Sección de marca */
.brand-section {
  max-width: 400px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.logo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.brand-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #94a3b8;
  margin-bottom: 2rem;
}

/* Redes sociales */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  background-color: #334155;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-link:hover {
  background-color: #3b82f6;
  color: white;
  transform: translateY(-2px);
}

.social-link svg {
  width: 18px;
  height: 18px;
}

/* Columnas del footer */
.footer-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-column {
  display: flex;
  flex-direction: column;
}

.column-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1.5rem;
  margin-top: 0;
}

.column-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.column-links li a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
  line-height: 1.5;
}

.column-links li a:hover {
  color: #3b82f6;
}

/* Barra inferior */
.footer-bottom {
  background-color: #0f172a;
  padding: 1rem 0;
  border-top: 1px solid #334155;
}

.bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #64748b;
}

.copyright {
  margin: 0;
}

.dedication {
  margin: 0;
  font-style: italic;
}

/* Botón de WhatsApp flotante */
.whatsapp-float {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background-color: #25d366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.whatsapp-float:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
}

.whatsapp-float svg {
  width: 32px;
  height: 32px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }

  .brand-section {
    max-width: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo {
    justify-content: center;
  }

  .social-links {
    justify-content: center;
  }

  .footer-columns {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    text-align: left;
  }
}

@media (max-width: 768px) {
  .footer-container {
    padding: 0 1rem;
  }

  .footer-main {
    padding: 2rem 0;
  }

  .footer-columns {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .bottom-content {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .whatsapp-float {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 55px;
    height: 55px;
  }

  .whatsapp-float svg {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .footer-main {
    padding: 1.5rem 0;
  }

  .footer-content {
    gap: 2rem;
  }

  .footer-columns {
    gap: 1.5rem;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .brand-description {
    font-size: 0.9rem;
  }

  .whatsapp-float {
    width: 50px;
    height: 50px;
  }

  .whatsapp-float svg {
    width: 24px;
    height: 24px;
  }
}
</style>
