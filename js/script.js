document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const successMsg = document.getElementById("contactSuccess");
  const errorMsg = document.getElementById("contactError");
  const submitBtn = document.getElementById("contactSubmitBtn");
  const originalBtnText = submitBtn ? submitBtn.textContent : "Enviar";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // limpiar mensajes previos
    if (successMsg) successMsg.classList.remove("is-visible");
    if (errorMsg) errorMsg.classList.remove("is-visible");

    // estado "enviando"
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
