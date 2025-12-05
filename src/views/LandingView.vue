<script setup>
import NavbarPublic from '@/components/layout/NavbarPublic.vue'
//import { useRouter } from 'vue-router'

//const router = useRouter()
</script>

<template>
  <div class="landing">
    <NavbarPublic />

    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-text">
          <h1>Encuentra servicios de limpieza confiables</h1>
          <p>
            Conectamos personas que necesitan servicios de limpieza con profesionales calificados de
            manera segura y transparente
          </p>
          <div class="hero-buttons">
            <router-link to="/servicios" class="btn btn-large btn-primary">
              Explorar servicios
            </router-link>
            <router-link to="/register" class="btn btn-large btn-secondary">
              Publicar servicio
            </router-link>
          </div>
        </div>
        <div class="hero-image">
          <div class="hero-illustration">
            <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="50" y="80" width="300" height="180" rx="20" fill="#667eea" opacity="0.1" />
              <circle cx="200" cy="120" r="40" fill="#667eea" opacity="0.2" />
              <path d="M150 170 L250 170 L250 220 L150 220 Z" fill="#764ba2" opacity="0.15" />
              <circle cx="180" cy="140" r="15" fill="#667eea" />
              <circle cx="220" cy="140" r="15" fill="#764ba2" />
              <path d="M170 200 Q200 220 230 200" stroke="#667eea" stroke-width="3" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2>¿Por qué elegir Gleemi?</h2>
          <p>La plataforma más completa para servicios de limpieza</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
                  fill="#667eea"
                  opacity="0.1"
                />
                <path
                  d="M24 14V24L30 30"
                  stroke="#667eea"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h3>Rápido y fácil</h3>
            <p>Encuentra y contrata servicios de limpieza en minutos. Proceso simple y directo</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect
                  x="10"
                  y="16"
                  width="28"
                  height="24"
                  rx="4"
                  stroke="#667eea"
                  stroke-width="3"
                  fill="none"
                />
                <path
                  d="M18 16V12C18 8.68629 20.6863 6 24 6C27.3137 6 30 8.68629 30 12V16"
                  stroke="#667eea"
                  stroke-width="3"
                />
                <circle cx="24" cy="28" r="3" fill="#667eea" />
              </svg>
            </div>
            <h3>Seguro y confiable</h3>
            <p>Pagos protegidos y usuarios verificados. Tu seguridad es nuestra prioridad</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect
                  x="8"
                  y="12"
                  width="32"
                  height="28"
                  rx="4"
                  stroke="#667eea"
                  stroke-width="3"
                  fill="none"
                />
                <path d="M8 20H40" stroke="#667eea" stroke-width="3" />
                <circle cx="16" cy="28" r="2" fill="#667eea" />
                <circle cx="24" cy="28" r="2" fill="#667eea" />
                <circle cx="32" cy="28" r="2" fill="#667eea" />
              </svg>
            </div>
            <h3>Chat integrado</h3>
            <p>Comunícate directamente con los proveedores sin salir de la plataforma</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 4L28.4 16.8H42L31 24.6L35.4 37.4L24 29.6L12.6 37.4L17 24.6L6 16.8H19.6L24 4Z"
                  fill="#667eea"
                  opacity="0.2"
                  stroke="#667eea"
                  stroke-width="2"
                />
              </svg>
            </div>
            <h3>Sistema de reseñas</h3>
            <p>Lee calificaciones de otros usuarios y toma decisiones informadas</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="16" r="8" stroke="#667eea" stroke-width="3" fill="none" />
                <path
                  d="M8 40C8 32 14 28 24 28C34 28 40 32 40 40"
                  stroke="#667eea"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h3>Perfiles verificados</h3>
            <p>Todos los proveedores pasan por un proceso de verificación riguroso</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M12 20C12 15.5817 15.5817 12 20 12H28C32.4183 12 36 15.5817 36 20V28C36 32.4183 32.4183 36 28 36H20C15.5817 36 12 32.4183 12 28V20Z"
                  stroke="#667eea"
                  stroke-width="3"
                  fill="none"
                />
                <path
                  d="M24 18V30M18 24H30"
                  stroke="#667eea"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h3>Precios transparentes</h3>
            <p>Compara precios y servicios. Sin costos ocultos ni sorpresas</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container cta-content">
        <h2>¿Listo para comenzar?</h2>
        <p>Únete a miles de usuarios que ya confían en Gleemi</p>
        <div class="cta-buttons">
          <router-link to="/register" class="btn btn-large btn-white">
            Registrarse gratis
          </router-link>
          <router-link to="/servicios" class="btn btn-large btn-outline">
            Ver servicios
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-brand">
          <h3>Gleemi</h3>
          <p>Conectando personas con servicios de limpieza de calidad</p>
        </div>
        <div class="footer-links">
          <div class="footer-column">
            <h4>Producto</h4>
            <router-link to="/servicios">Servicios</router-link>
            <router-link to="/register">Publicar</router-link>
          </div>
          <div class="footer-column">
            <h4>Empresa</h4>
            <a href="#">Acerca de</a>
            <a href="#">Contacto</a>
          </div>
          <div class="footer-column">
            <h4>Legal</h4>
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>&copy; 2025 Gleemi. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  background: #f5f7fa;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px 120px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.2;
}

.hero-text p {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.95;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-illustration {
  width: 100%;
  max-width: 400px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Buttons */
.btn {
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  display: inline-block;
  cursor: pointer;
  border: none;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-white {
  background: white;
  color: #667eea;
}

.btn-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.4);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-outline:hover {
  background: white;
  color: #667eea;
}

/* Features Section */
.features {
  padding: 100px 20px;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 40px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.section-header p {
  font-size: 18px;
  color: #6b7280;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  padding: 32px;
  border-radius: 16px;
  background: #f9fafb;
  transition: all 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
  background: white;
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: white;
}

.feature-card h3 {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

/* CTA Section */
.cta {
  padding: 100px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.95;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Footer */
.footer {
  background: #1f2937;
  color: white;
  padding: 60px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 60px;
  margin-bottom: 40px;
}

.footer-brand h3 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #667eea;
}

.footer-brand p {
  color: #9ca3af;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-column h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: white;
}

.footer-column a {
  display: block;
  color: #9ca3af;
  text-decoration: none;
  margin-bottom: 12px;
  transition: color 0.3s ease;
}

.footer-column a:hover {
  color: #667eea;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: 20px;
  text-align: center;
}

.footer-bottom p {
  color: #9ca3af;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 968px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .hero-text h1 {
    font-size: 36px;
  }

  .hero-text p {
    font-size: 18px;
  }

  .hero-illustration {
    max-width: 300px;
  }

  .section-header h2 {
    font-size: 32px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
