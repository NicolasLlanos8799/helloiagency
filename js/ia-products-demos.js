(function () {
  const WEBHOOK_URL = "https://nicolasllanossw8.app.n8n.cloud/webhook/iagency/webchat";
  const SESSION_KEY = "ia_session_id";

  function ensureSessionId() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return stored;
    } catch (err) {
      console.warn("No se pudo leer localStorage", err);
    }

    const fallbackId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ia-${Date.now()}`;

    try {
      localStorage.setItem(SESSION_KEY, fallbackId);
    } catch (err) {
      console.warn("No se pudo guardar el session_id", err);
    }

    return fallbackId;
  }

  function renderMessage(listEl, text, role) {
    if (!listEl) return;
    const message = document.createElement("div");
    message.className = `ia-chat-message ${role}`;
    message.textContent = text;
    listEl.appendChild(message);
    listEl.scrollTop = listEl.scrollHeight;
  }

  function toggleTyping(typingEl, isVisible) {
    if (!typingEl) return;
    typingEl.hidden = !isVisible;
  }

  function parseReply(data) {
    if (!data) return "No pude responder eso. Probá reformular.";
    return data.reply || data.respuesta || data.text || data.message || (typeof data === "string" ? data : "") || "No pude responder eso. Probá reformular.";
  }

  async function sendMessage(payload) {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error de red: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  function createChatDemo(card, moduleName, sessionId) {
    const demo = card.querySelector(".product-demo");
    const toggleBtn = card.querySelector(".product-demo-toggle");
    const messagesEl = card.querySelector(".ia-chat-messages");
    const typingEl = card.querySelector(".ia-chat-typing");
    const form = card.querySelector(".ia-chat-input");
    const input = form ? form.querySelector("input[name='message']") : null;
    const chips = card.querySelectorAll(".chat-chip");

    if (!demo || !toggleBtn || !form || !input || !messagesEl) return;

    toggleBtn.addEventListener("click", () => {
      const isOpen = !demo.hidden;
      demo.hidden = isOpen;
      toggleBtn.setAttribute("aria-expanded", String(!isOpen));
      toggleBtn.textContent = isOpen ? "Probar demo" : "Ocultar demo";
    });

    const handleSend = async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      renderMessage(messagesEl, trimmed, "user");
      input.value = "";
      toggleTyping(typingEl, true);

      const payload = {
        message: trimmed,
        session_id: sessionId,
        business_id: "iagency",
        page: window.location.pathname,
        module: moduleName,
      };

      try {
        const data = await sendMessage(payload);
        const reply = parseReply(data);
        renderMessage(messagesEl, reply, "bot");
      } catch (err) {
        console.error(err);
        renderMessage(messagesEl, "Ahora mismo no estoy disponible. Probá de nuevo en unos segundos.", "bot");
      } finally {
        toggleTyping(typingEl, false);
      }
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleSend(input.value);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend(input.value);
      }
    });

    chips.forEach((chip) => {
      chip.addEventListener("click", () => handleSend(chip.textContent || ""));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const sessionId = ensureSessionId();
    document.querySelectorAll(".product-card").forEach((card) => {
      const moduleName = card.dataset.module;
      if (!moduleName) return;
      createChatDemo(card, moduleName, sessionId);
    });
  });
})();
