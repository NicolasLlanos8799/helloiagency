/**
 * ============================================================================
 * GA4 ENTERPRISE TRACKING HELPERS
 * ============================================================================
 */
function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     Enterprise Tracking: Scroll 75%
     ========================================= */
  let scroll75Sent = false;
  window.addEventListener('scroll', () => {
    if (scroll75Sent) return;
    const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
    if (scrollPercent >= 0.75) {
      scroll75Sent = true;
      trackEvent('scroll_75');
    }
  }, { passive: true });

  /* =========================================
     Enterprise Tracking: CTA Clicks
     ========================================= */
  // Delegación para capturar clicks en botones de acción
  document.addEventListener('click', (e) => {
    const cta = e.target.closest('.btn, .nav-link, .product-custom-link');
    if (!cta) return;

    let location = 'section';
    if (cta.closest('.navbar')) location = 'hero'; // Consideramos Nav/Hero como parte del inicio
    if (cta.closest('.footer') || cta.id === 'contactSubmitBtn') location = 'footer';
    if (cta.closest('.hero')) location = 'hero';

    trackEvent('cta_click', {
      cta_location: location
    });

    // Tracking específico para tipos de asistentes (reutilizando lógica previa)
    const assistantType = cta.getAttribute('data-ga-assistant');
    if (assistantType) {
      trackEvent('click_probar_asistente', {
        assistant_type: assistantType,
        location: 'products_section',
        transport_type: 'beacon'
      });
    }
  });

  /* =========================================
     Prefill Contact Form
     ========================================= */
  const prefillBtns = document.querySelectorAll(".js-prefill-btn");
  const messageInput = document.getElementById("mensaje");
  const nameInput = document.getElementById("nombre");

  if (prefillBtns.length > 0 && messageInput) {
    prefillBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const text = btn.getAttribute("data-prefill");
        if (text) {
          messageInput.value = text;
          setTimeout(() => {
            if (nameInput) nameInput.focus();
          }, 100);
        }
      });
    });
  }

  const form = document.getElementById("contactForm");
  if (!form) return;

  const successMsg = document.getElementById("contactSuccess");
  const errorMsg = document.getElementById("contactError");
  const submitBtn = document.getElementById("contactSubmitBtn");
  const originalBtnText = submitBtn ? submitBtn.textContent : "Enviar";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (successMsg) successMsg.classList.remove("is-visible");
    if (errorMsg) errorMsg.classList.remove("is-visible");

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      submitBtn.textContent = "Enviando…";
    }

    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        if (successMsg) successMsg.classList.add("is-visible");

        // Enterprise Tracking: Lead Conversion
        trackEvent('lead_form_submit', {
          form_id: 'contactForm',
          product: 'helloiagency'
        });

      } else {
        if (errorMsg) errorMsg.classList.add("is-visible");
      }
    } catch (err) {
      if (errorMsg) errorMsg.classList.add("is-visible");
      console.error("Error al enviar el formulario:", err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
        submitBtn.textContent = originalBtnText;
      }
    }
  });
});
