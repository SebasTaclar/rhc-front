<template>
  <section class="contact-section">
    <div class="container">
      <header class="head">
        <h2>Contacto</h2>
        <p>Cuéntanos sobre tu empresa y te contactaremos en menos de 24 horas.</p>
      </header>

      <div class="columns">
        <div class="col-left">
          <ul class="contact-list">
            <li>
              <div class="icon phone" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12 1.05.37 2.07.72 3.03a2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 6 6l1.05-1.05a2 2 0 0 1 2.11-.45c.96.35 1.98.6 3.03.72A2 2 0 0 1 22 16.92z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div class="title">Teléfono</div>
                <div class="value">+57 320 000 0000</div>
                <div class="meta">Lun - Vie: 8:00 AM - 6:00 PM</div>
              </div>
            </li>

            <li>
              <div class="icon whatsapp" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 .03 5.36.03 12c0 2.11.56 4.18 1.62 6.02L0 24l6.11-1.61A11.94 11.94 0 0 0 12 24c6.63 0 12-5.36 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 21.5a9.45 9.45 0 0 1-5.03-1.39l-.36-.21L4 20l1.54-2.57-.2-.37A9.5 9.5 0 1 1 21.5 12 9.45 9.45 0 0 1 12 21.5z" fill="currentColor"/>
                  <path d="M17.2 14.1c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15s-.78.97-.96 1.17c-.18.21-.36.24-.67.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.74-1.66-2.04-.18-.31-.02-.48.13-.63.14-.14.3-.37.45-.56.15-.18.2-.31.3-.52.1-.21.05-.39-.02-.54-.07-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52-.18-.01-.39-.01-.6-.01s-.54.08-.83.39c-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.27.16.21 2.22 3.5 5.38 4.77 3.16 1.27 3.16.85 3.73.8.57-.05 1.85-.75 2.11-1.47.26-.72.26-1.34.18-1.47-.08-.12-.28-.19-.58-.34z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div class="title">WhatsApp</div>
                <div class="value">+57 320 000 0000</div>
                <div class="meta">Respuesta inmediata</div>
              </div>
            </li>

            <li>
              <div class="icon email" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div class="title">Email</div>
                <div class="value">contacto@rhcasesorias.com</div>
                <div class="meta">Respuesta en 24 horas</div>
              </div>
            </li>

            <li>
              <div class="icon office" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div class="title">Oficina Principal</div>
                <div class="value">Cra 10 # 20-30, Bogotá</div>
                <div class="meta">También atendemos virtualmente</div>
              </div>
            </li>

            <li>
              <div class="icon hours" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1zm1 12.59V7a1 1 0 0 0-2 0v6h6a1 1 0 0 0 0-2h-4z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div class="title">Horarios de Atención</div>
                <div class="value">Lunes a Viernes: 8:00 AM - 6:00 PM</div>
                <div class="meta">Sábados: 9:00 AM - 2:00 PM</div>
              </div>
            </li>
          </ul>

          <div class="map-placeholder">
            <div class="map-row">
              <div>
                <strong>Ubicación</strong>
                <!-- <div class="map-addr">Cra 10 # 20-30, Bogotá</div> -->
              </div>
              <!-- <div class="map-cta">
                <a :href="whatsappLink" class="whatsapp-btn" target="_blank" rel="noreferrer">Abrir WhatsApp</a>
              </div> -->

            </div>

            <div class="map-iframe">
              <iframe
                width="100%"
                height="220"
                style="border:0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.000000000!2d-74.080000000!3d4.600000000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNfCsMzYnMzAuMCJOIDc0wrAwNScwMC4wIlc!5e0!3m2!1ses!2sco!4v0000000000"
              ></iframe>
            </div>
          </div>
        </div>

        <div class="col-right">
          <form class="contact-form" @submit.prevent="onSubmit" novalidate>
            <header class="form-head">
              <h3>Envíanos un mensaje</h3>
              <p>Describe brevemente tu consulta y te responderemos pronto.</p>
            </header>

            <!-- two-column row: name + email -->
            <div class="row two-cols">
              <div class="col">
                <label class="sr-only">Nombre</label>
                <input type="text" placeholder="Tu nombre" v-model="form.name" required aria-label="Nombre" :class="{ 'text-filled': has(form.name) }" />
              </div>
              <div class="col">
                <label class="sr-only">Correo</label>
                <input type="email" placeholder="tu@email.com" v-model="form.email" required aria-label="Correo" :class="{ 'text-filled': has(form.email) }" />
              </div>
            </div>

            <!-- phone as single input row -->
            <div class="row">
              <div class="col-full">
                <label class="sr-only">Teléfono</label>
                <input type="tel" placeholder="+57 000 000 0000" v-model="form.phone" aria-label="Teléfono" :class="{ 'text-filled': has(form.phone) }" />
              </div>
            </div>

            <!-- message textarea -->
            <div class="row">
              <div class="col-full">
                <label class="sr-only">Mensaje</label>
                <textarea placeholder="Cuéntanos qué necesitas..." v-model="form.message" rows="6" aria-label="Mensaje" :class="{ 'text-filled': has(form.message) }"></textarea>
              </div>
            </div>

            <!-- actions: note left, button right -->
            <div class="row actions">
              <div class="left-note">
                <div v-if="error" class="form-error" role="alert">{{ error }}</div>
                <div v-if="success" class="form-success" role="status">Mensaje enviado correctamente.</div>
              </div>

              <div class="right-action">
                <button class="btn-primary send-btn" type="submit" :disabled="loading">
                  <span v-if="!loading">Enviar mensaje</span>
                  <span v-else>Enviando...</span>
                  <svg class="send-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({ name: '', email: '', phone: '', message: '' })
const loading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

const validate = () => {
  if (!form.name || !form.email || !form.message) {
    error.value = 'Por favor completa nombre, email y mensaje.'
    return false
  }
  // simple email regex
  const emailRe = /^\S+@\S+\.\S+$/
  if (!emailRe.test(form.email)) {
    error.value = 'Email inválido.'
    return false
  }
  error.value = null
  return true
}

const onSubmit = async () => {
  if (!validate()) return
  loading.value = true
  success.value = false
  try {
    const payload = { ...form }
    const res = await fetch('https://httpbin.org/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Error en el envío')
    success.value = true
    // clear form
    form.name = ''
    form.email = ''
    form.phone = ''
    form.message = ''
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    error.value = msg || 'Error inesperado'
  } finally {
    loading.value = false
    setTimeout(() => { success.value = false }, 3500)
  }
}

// helper to check if a field has value for conditional class
const has = (val: string) => !!val && val.toString().trim().length > 0
</script>


<style scoped>
.contact-section { padding: 56px 0; background: white; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 6%; }
.head h2 { font-size: 24px; color: #0b254e; }
.head p { color: #6b7280; margin-bottom: 18px; }
.columns { display:flex; gap: 32px; align-items:flex-start; }
.col-left { flex: 1; }
.col-right { width: 520px; }

.contact-list { list-style: none; padding: 0; margin: 0 0 20px 0; display: grid; gap: 18px; }
.contact-list li { display:flex; gap: 12px; align-items:flex-start; }
.icon { width: 44px; height: 44px; border-radius: 8px; display:flex; align-items:center; justify-content:center; color: white; font-weight:700; }
.icon.phone { background: #123b8a; }
.icon.whatsapp { background: #25D366; }
.icon.email { background: #0b61d6; }
.icon.office { background: #0b3a99; }
.icon.hours { background: #123b8a; }
.title { font-weight:700; color:#0b254e }
.value { color:#374151 }
.meta { color:#9aa6be; font-size:12px }

.map-placeholder { background:#f5f7fa; border-radius:8px; padding:18px; margin-top:18px; }

.map-row { display:flex; gap:12px; align-items:center; justify-content:space-between }
.map-cta { display:flex; gap:10px; align-items:center }
.whatsapp-btn { background:#25D366; color:white; padding:8px 12px; border-radius:8px; border:none; cursor:pointer }

.contact-form { background: #ffffff; border-radius: 12px; padding: 18px; box-shadow: 0 10px 30px rgba(2,6,23,0.06); }
.row { display:flex; gap:12px; margin-bottom:12px; }
.two-cols { gap:12px; }
.two-cols .col { flex: 1; }
.col-full { width:100%; }
.row input, .row textarea { width:100%; padding: 10px 12px; border-radius:8px; border:1px solid #e6eef6; }
.actions { align-items:center; gap:14px; display:flex; justify-content:space-between; }
.left-note { flex:1; }
.right-action { display:flex; align-items:center; }
.btn-primary { background: #0b3a99; color:white; padding:12px 18px; border-radius:999px; border:none; display:inline-flex; gap:10px; align-items:center; }
.send-icon { opacity: .95 }
.note { color:#9aa6be; font-size:12px; display:block; margin-bottom:6px }
.form-error { color:#b91c1c; font-size:13px; margin-top:6px }
.form-success { color:#064e3b; font-size:13px; margin-top:6px }

.whatsapp-btn { background:#25D366; color:white; padding:8px 12px; border-radius:8px; border:none; cursor:pointer; text-decoration:none }

/* Filled inputs: text should be black, placeholder remains muted */
.row input.text-filled, .row textarea.text-filled { color: #000; }
.row input::placeholder, .row textarea::placeholder { color: #9aa6be; }


@media (max-width: 992px) {
  .columns{ flex-direction: column; }
  .col-right { width: 100%; }
}

@media (max-width: 520px) {
  .two-cols { flex-direction: column }
  .actions { flex-direction: column; align-items:stretch; gap:8px }
  .right-action { justify-content:flex-end }
}
</style>
