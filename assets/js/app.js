/* ==============================================================
   ANTAC - app.js
   UI handlers: mobile menu, tabs, modales, reveal-on-scroll,
   upload zones, lucide icons init.
   ============================================================== */

(function () {
  'use strict';

  // ------- Lucide icons -------
  // Lucide se carga con defer; esperamos a DOMContentLoaded
  function initLucide() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLucide);
  } else {
    initLucide();
  }
  // Re-init por si se inyecta HTML dinámico (modales)
  document.addEventListener('DOMContentLoaded', () => {
    // Re-init después de cargar todo (incluido Manrope)
    setTimeout(initLucide, 100);
  });

  // ------- Mobile menu toggle -------
  const mobToggle = document.getElementById('mob-toggle');
  const mobMenu   = document.getElementById('mob-menu');

  if (mobToggle && mobMenu) {
    mobToggle.addEventListener('click', () => {
      const isOpen = !mobMenu.classList.contains('hidden');
      if (isOpen) {
        mobMenu.classList.add('hidden');
        mobToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobMenu.classList.remove('hidden');
        mobToggle.setAttribute('aria-expanded', 'true');
      }
    });
    // Cerrar al hacer click en un link
    mobMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobMenu.classList.add('hidden');
        mobToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ------- Tabs (Registro unidades / operadores) -------
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels  = {
    unidad:   document.getElementById('tab-unidad'),
    operador: document.getElementById('tab-operador')
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabButtons.forEach(b => {
        const active = b === btn;
        b.setAttribute('aria-selected', active ? 'true' : 'false');
        b.classList.toggle('border-primary-600', active);
        b.classList.toggle('text-primary-600', active);
        b.classList.toggle('border-transparent', !active);
        b.classList.toggle('text-ink-600', !active);
      });
      Object.entries(tabPanels).forEach(([key, panel]) => {
        if (!panel) return;
        panel.classList.toggle('hidden', key !== target);
      });
    });
  });

  // ------- Modales -------
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle   = document.getElementById('modal-title');
  const modalBody    = modalOverlay ? modalOverlay.querySelector('.prose') : null;
  const modalClose   = document.getElementById('modal-close');

  const MODAL_CONTENT = {
    etica: {
      title: 'Código de Ética',
      html: `
        <p>El Código de Ética de ANTAC establece los principios y valores que rigen la conducta de la Mesa Directiva, los delegados estatales, las comisiones de trabajo y los agremiados en su relación con la asociación, con las autoridades y con la sociedad.</p>
        <h4>Principios fundamentales</h4>
        <ul>
          <li><strong>Transparencia:</strong> Toda gestión directiva se documenta y se somete a asamblea ordinaria anual.</li>
          <li><strong>Rendición de cuentas:</strong> Estados financieros auditados por despacho externo, publicados en el sitio web.</li>
          <li><strong>No lucro personal:</strong> Ningún directivo percibe salario, compensación ni beneficio personal por su cargo.</li>
          <li><strong>Igualdad gremial:</strong> Un agremiado, un voto. Sin preferencias por tamaño de flota ni antigüedad.</li>
          <li><strong>Confidencialidad:</strong> Los datos personales y operativos de los agremiados son reservados y se tratan conforme a la LFPDPPP.</li>
        </ul>
        <h4>Sanciones</h4>
        <p>El incumplimiento de cualquier principio es motivo de suspensión de derechos gremiales y, en su caso, de baja definitiva, previo procedimiento ante el Consejo de Vigilancia con derecho de audiencia.</p>
      `
    },
    legal: {
      title: 'Marco Legal y Normativo',
      html: `
        <p>ANTAC opera dentro del siguiente marco normativo vigente en México:</p>
        <ul>
          <li><strong>Constitución Política de los Estados Unidos Mexicanos</strong> — Arts. 5, 9, 11 y 115 sobre libre tránsito y derechos de asociación.</li>
          <li><strong>Ley de Caminos, Puentes y Autotransporte Federal</strong> — Regula permisos, modalidades y obligaciones del autotransporte federal de carga.</li>
          <li><strong>Reglamento de Autotransporte Federal y Servicios Auxiliares</strong> — Detalla operación, tipos de permiso y verificación.</li>
          <li><strong>Ley de Movilidad y Seguridad Vial del Estado de México y Ciudad de México</strong> — Aplicable en rutas locales.</li>
          <li><strong>NOM-012-SCT-2-2017</strong> — Peso y dimensiones vehiculares.</li>
          <li><strong>NOM-001-SCT-2-2016</strong> — Placas metálicas de identificación vehicular.</li>
          <li><strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> — Tratamiento de datos de agremiados.</li>
        </ul>
        <p>El equipo legal de ANTAC mantiene un repositorio actualizado de las reformas aplicables al sector.</p>
      `
    },
    estructura: {
      title: 'Estructura Organizacional',
      html: `
        <p>ANTAC se gobierna por una estructura democrática, con elección directa de la Mesa Directiva cada tres años.</p>
        <h4>Mesa Directiva (2024-2027)</h4>
        <ul>
          <li><strong>Presidente:</strong> Ing. Rosalío Treviño Fuentes</li>
          <li><strong>Secretario General:</strong> Lic. Ma. Guadalupe Andrade Rentería</li>
          <li><strong>Tesorero:</strong> C.P. Heriberto Montalvo Castañeda</li>
          <li><strong>Vocales:</strong> 7 representantes regionales (Norte, Centro, Sur, Bajío, Pacífico, Golfo, Península)</li>
        </ul>
        <h4>Órganos auxiliares</h4>
        <ul>
          <li><strong>Consejo de Vigilancia</strong> — 3 miembros electos, sin parentesco con la Mesa Directiva.</li>
          <li><strong>Comisión de Asuntos Legales</strong> — 5 abogados litigantes agremiados.</li>
          <li><strong>Comisión de Tecnología</strong> — Mantenimiento y evolución de ANTAC-Fleet.</li>
          <li><strong>Delegaciones estatales</strong> — 24 delegados con voz y voto en asamblea.</li>
        </ul>
      `
    }
  };

  function openModal(key) {
    const cfg = MODAL_CONTENT[key];
    if (!cfg || !modalOverlay || !modalTitle || !modalBody) return;
    modalTitle.textContent = cfg.title;
    modalBody.innerHTML = cfg.html;
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
    // Re-init lucide (por si hay íconos en el contenido)
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.modal-trigger').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && !modalOverlay.classList.contains('hidden')) {
      closeModal();
    }
  });

  // ------- Upload zones (drag & drop + click) -------
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  document.querySelectorAll('.upload-zone').forEach(zone => {
    const fileInput = zone.querySelector('input[type="file"]');
    if (!fileInput) return;

    const placeholder = zone.querySelector('.upload-placeholder');
    const successEl   = zone.querySelector('.upload-success');
    const fileNameEl  = zone.querySelector('.file-name');

    function handleFile(file) {
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        showToast('El archivo "' + file.name + '" excede el límite de 10 MB.', 'error');
        fileInput.value = '';
        return;
      }
      if (placeholder) placeholder.classList.add('hidden');
      if (successEl) successEl.classList.remove('hidden');
      if (fileNameEl) fileNameEl.textContent = file.name;
      zone.classList.add('has-file');
    }

    // Click en la zona abre el file picker
    zone.addEventListener('click', (e) => {
      // Si el click viene del input, no hacer loop
      if (e.target === fileInput) return;
      fileInput.click();
    });
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        handleFile(fileInput.files[0]);
      }
    });

    // Drag & drop
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('border-primary-500', 'bg-primary-50');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('border-primary-500', 'bg-primary-50');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('border-primary-500', 'bg-primary-50');
      const file = e.dataTransfer.files[0];
      if (file) {
        // Crear un DataTransfer para asignar al input
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInput.files = dt.files;
          handleFile(file);
        } catch (err) {
          // Fallback para browsers que no soportan DataTransfer constructor
          handleFile(file);
        }
      }
    });
  });

  // ------- Reveal on scroll (con transform/opacity, a11y) -------
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Aplicar a las secciones principales
    document.querySelectorAll('section').forEach(sec => {
      sec.classList.add('reveal');
      reveal.observe(sec);
    });
  }

  // ------- Header hide/show en scroll -------
  // (regla emilkowalski: 200-220ms ease-out, interruptible)
  const siteHeader = document.querySelector('.site-header');
  const floatingCta = document.getElementById('floating-cta');
  let lastScrollY = 0;
  const HIDE_THRESHOLD = 12;  // px de scroll down para ocultar
  const SHOW_THRESHOLD = 4;   // px de scroll up para mostrar
  const MIN_SHOW_PX = 80;     // a partir de este Y se permite ocultar

  function updateHeader() {
    const y = window.scrollY;
    if (!siteHeader) return;
    const delta = y - lastScrollY;

    if (y <= MIN_SHOW_PX) {
      // Cerca del top → header siempre visible, CTA oculto
      siteHeader.classList.remove('is-hidden');
      if (floatingCta) {
        floatingCta.classList.remove('is-visible');
        floatingCta.setAttribute('aria-hidden', 'true');
      }
    } else if (delta > HIDE_THRESHOLD) {
      // Scroll down → ocultar header, mostrar floating CTA
      siteHeader.classList.add('is-hidden');
      if (floatingCta) {
        floatingCta.classList.add('is-visible');
        floatingCta.setAttribute('aria-hidden', 'false');
      }
    } else if (delta < -SHOW_THRESHOLD) {
      // Scroll up → mostrar header, ocultar floating CTA
      siteHeader.classList.remove('is-hidden');
      if (floatingCta) {
        floatingCta.classList.remove('is-visible');
        floatingCta.setAttribute('aria-hidden', 'true');
      }
    }

    lastScrollY = y;
  }

  // rAF para no spamear el reflow
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ------- Count-up para los stats del hero -------
  // Anima el número desde 0 hasta data-target cuando entra en viewport
  // Una sola vez. Ease-out. Respetar prefers-reduced-motion.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = document.querySelectorAll('.counter');

  function formatNumber(n) {
    // Para números grandes como 2847 → 2,847
    return n.toLocaleString('es-MX');
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const duration = 1500;
    if (prefersReducedMotion) {
      el.textContent = prefix + formatNumber(target);
      return;
    }
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = prefix + formatNumber(value);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + formatNumber(target);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length > 0) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => counterObs.observe(c));
  } else {
    // Fallback: mostrar el valor final directo
    counters.forEach(c => {
      const target = parseInt(c.dataset.target, 10);
      c.textContent = (c.dataset.prefix || '') + formatNumber(target);
    });
  }

  // ------- Ripple effect en floating CTA -------
  if (floatingCta) {
    const btn = floatingCta.querySelector('.btn-float');
    if (btn) {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top  = (e.clientY - rect.top)  + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    }
  }

  // ------- Hero parallax sutil -------
  // El badge y los stats se mueven más lento que el scroll (ratio 0.3-0.5)
  // Solo en desktop (>= lg). Desactivado si prefers-reduced-motion.
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  if (isDesktop && !prefersReducedMotion) {
    const heroBadge  = document.querySelector('#inicio .pill, #inicio [class*="pill"]');
    const heroStats  = document.querySelector('#inicio dl');
    const heroVisual = document.querySelector('#inicio img[alt*="transportistas" i], #inicio img[alt*="operador" i]');

    function updateParallax() {
      const y = window.scrollY;
      if (y > 800) return;  // solo dentro del hero
      if (heroBadge)  heroBadge.style.transform  = `translateY(${y * 0.15}px)`;
      if (heroStats)  heroStats.style.transform  = `translateY(${y * 0.25}px)`;
      if (heroVisual) heroVisual.style.transform = `translateY(${y * 0.08}px) scale(${1 - y * 0.0001})`;
    }
    let pTicking = false;
    window.addEventListener('scroll', () => {
      if (!pTicking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          pTicking = false;
        });
        pTicking = true;
      }
    }, { passive: true });
  }

  // ------- Toast (expuesto para forms.js) -------
  function showToast(msg, type) {
    const toast = document.getElementById('toast');
    const toastMsg  = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    if (toastIcon) {
      if (type === 'error') {
        toastIcon.setAttribute('data-lucide', 'x-circle');
        toastIcon.classList.remove('text-green-400');
        toastIcon.classList.add('text-red-400');
      } else {
        toastIcon.setAttribute('data-lucide', 'check-circle-2');
        toastIcon.classList.remove('text-red-400');
        toastIcon.classList.add('text-green-400');
      }
      if (window.lucide) window.lucide.createIcons();
    }

    toast.classList.remove('hidden');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 4500);
  }
  window.showToast = showToast;

})();
