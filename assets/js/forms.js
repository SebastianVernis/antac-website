/* ==============================================================
   ANTAC - forms.js
   Integración con Web3Forms para los 3 formularios:
     - Afiliación          (#form-afiliacion)
     - Registro Unidad     (#form-unidad)
     - Registro Operador   (#form-operador)
     - Consulta de contacto (#form-contacto)

   Configuración: pegar el access_key de web3forms.com en
   WEB3FORMS_ACCESS_KEY. Si queda como "YOUR_WEB3FORMS_KEY",
   los submits se loguean en consola y se muestran como "modo demo".
   ============================================================== */

(function () {
  'use strict';

  // ====== CONFIGURACIÓN ======
  const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_KEY';
  const WEB3FORMS_ENDPOINT   = 'https://api.web3forms.com/submit';

  // Cada form tiene su subject diferenciado
  const FORM_CONFIG = {
    'form-afiliacion': {
      label:   'afiliación',
      subject: '[ANTAC] Nueva solicitud de AFILIACIÓN',
      mensajeExito: '¡Solicitud de afiliación enviada! Te contactaremos en menos de 24 hrs hábiles.'
    },
    'form-unidad': {
      label:   'registro de unidad',
      subject: '[ANTAC] Nuevo REGISTRO DE UNIDAD',
      mensajeExito: '¡Registro de unidad enviado! Validaremos tus documentos y confirmaremos por correo.'
    },
    'form-operador': {
      label:   'registro de operador',
      subject: '[ANTAC] Nuevo REGISTRO DE OPERADOR',
      mensajeExito: '¡Registro de operador enviado! Confirmaremos la validación de tu licencia y documentos.'
    },
    'form-contacto': {
      label:   'consulta',
      subject: '[ANTAC] Nueva CONSULTA desde sitio web',
      mensajeExito: '¡Mensaje enviado! Te responderemos en menos de 24 hrs hábiles.'
    }
  };

  // ====== UTILIDADES ======
  function isPlaceholderKey() {
    return !WEB3FORMS_ACCESS_KEY
        || WEB3FORMS_ACCESS_KEY === 'YOUR_WEB3FORMS_KEY'
        || WEB3FORMS_ACCESS_KEY.length < 8;
  }

  function showToast(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    } else {
      console.log('[toast]', type || 'info', msg);
    }
  }

  function setSubmitting(form, submitting) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return () => {};
    const original = btn.innerHTML;
    if (submitting) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span> Enviando…';
    } else {
      btn.disabled = false;
      btn.innerHTML = original;
    }
    return () => { btn.disabled = false; btn.innerHTML = original; };
  }

  // Resetea upload zones visualmente
  function resetUploadZones(form) {
    form.querySelectorAll('.upload-zone').forEach((z) => {
      z.classList.remove('has-file');
      const ph = z.querySelector('.upload-placeholder');
      const su = z.querySelector('.upload-success');
      if (ph) ph.classList.remove('hidden');
      if (su) su.classList.add('hidden');
      const inp = z.querySelector('input[type="file"]');
      if (inp) inp.value = '';
    });
  }

  // Lista los archivos subidos (no adjunta los binarios)
  function collectFileList(form) {
    const lines = [];
    form.querySelectorAll('.upload-zone').forEach((z) => {
      // Encontrar el label del documento (es el label hermano anterior)
      let nombreDoc = 'Documento';
      const prev = z.parentElement && z.parentElement.querySelector('label');
      if (prev) nombreDoc = prev.textContent.replace('*', '').trim();
      const fnameEl = z.querySelector('.file-name');
      if (z.classList.contains('has-file') && fnameEl) {
        lines.push('  - ' + nombreDoc + ': ' + fnameEl.textContent.trim());
      } else {
        lines.push('  - ' + nombreDoc + ': [no adjuntado]');
      }
    });
    return lines.length ? '\n\nDocumentos:\n' + lines.join('\n') : '';
  }

  function buildPayload(form) {
    const fd = new FormData(form);
    const data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      from_name:  'ANTAC - Sitio Web',
      botcheck:   '' // honeypot
    };
    // Copiar todos los campos del form
    for (const [k, v] of fd.entries()) {
      if (typeof v === 'string') {
        data[k] = v;
      }
    }
    // Añadir lista de documentos al mensaje
    const docs = collectFileList(form);
    if (data.mensaje) {
      data.mensaje = data.mensaje + docs;
    } else {
      // Construir resumen legible
      const lines = [];
      for (const [k, v] of fd.entries()) {
        if (typeof v === 'string' && v.trim() && k !== 'botcheck' && k !== 'access_key') {
          lines.push('  - ' + k + ': ' + v);
        }
      }
      data.mensaje = 'Solicitud desde el sitio web ANTAC' + docs + '\n\nDatos:\n' + lines.join('\n');
    }
    return data;
  }

  async function submitToWeb3Forms(data) {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(data)
    });
    let json = null;
    try { json = await res.json(); } catch (e) { /* no-json */ }
    return { ok: res.ok, status: res.status, json: json };
  }

  async function handleFormSubmit(ev) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const id   = form.id;
    const cfg  = FORM_CONFIG[id];
    if (!cfg) {
      console.warn('[forms.js] Form sin config:', id);
      return;
    }

    // Validación HTML5 nativa
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data    = buildPayload(form);
    data.subject = cfg.subject;
    const restore = setSubmitting(form, true);

    if (isPlaceholderKey()) {
      // MODO DEMO
      console.group('[forms.js] DEMO MODE - Web3Forms no configurado');
      console.log('Subject:', cfg.subject);
      console.log('Payload:', data);
      console.groupEnd();
      showToast('Modo demo: el access_key de Web3Forms no está configurado. Revisa la consola.', 'error');
      form.reset();
      resetUploadZones(form);
      restore();
      return;
    }

    try {
      const result = await submitToWeb3Forms(data);
      if (result.ok && result.json && result.json.success) {
        showToast(cfg.mensajeExito, 'ok');
        form.reset();
        resetUploadZones(form);
      } else {
        const msg = (result.json && result.json.message)
          ? result.json.message
          : ('Error ' + result.status + ' al enviar el formulario.');
        showToast(msg, 'error');
        console.error('[forms.js] Web3Forms error:', result);
      }
    } catch (err) {
      console.error('[forms.js] Network error:', err);
      showToast('No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.', 'error');
    } finally {
      restore();
    }
  }

  // ====== BIND ======
  document.addEventListener('DOMContentLoaded', function () {
    Object.keys(FORM_CONFIG).forEach((id) => {
      const f = document.getElementById(id);
      if (f) f.addEventListener('submit', handleFormSubmit);
    });

    if (isPlaceholderKey()) {
      console.warn(
        '%c[ANTAC forms.js] Web3Forms access_key no configurado. Los formularios están en MODO DEMO. ' +
        'Para activarlos, edita assets/js/forms.js y reemplaza YOUR_WEB3FORMS_KEY por tu key real de web3forms.com.',
        'color:#DC2626;font-weight:bold;'
      );
    } else {
      console.log('%c[ANTAC forms.js] Web3Forms activo.', 'color:#16A34A;font-weight:bold;');
    }
  });
})();
