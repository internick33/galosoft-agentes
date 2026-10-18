/* =========================================================
   Galosoft Agentes · JavaScript compartido por todo el sitio
   ========================================================= */

/* CONFIGURACIÓN ÚNICA
   Pega aquí la URL de producción del webhook de n8n que recibe los leads.
   Ejemplo: "https://n8n.tudominio.com/webhook/galosoft-agentes-leads"
   Si se deja vacío, los formularios funcionan en modo demostración (no envían nada). */
const WEBHOOK_URL = "";

(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Menú móvil */
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* Año en el footer */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* Ondas de voz (cualquier <canvas class="wave">) */
  document.querySelectorAll("canvas.wave").forEach((cv) => {
    const ctx = cv.getContext("2d");
    let w = 0, h = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);
    const bars = 64;
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const gap = w / bars, speaking = Math.sin(t / 1400) > -0.3;
      for (let i = 0; i < bars; i++) {
        const x = i * gap + gap / 2;
        const env = Math.sin((i / bars) * Math.PI);
        const n = Math.sin(t / 180 + i * 0.55) * Math.sin(t / 420 + i * 0.21) * 0.5 + 0.5;
        const amp = (speaking ? 0.25 + n * 0.75 : 0.08 + n * 0.12) * env;
        const bh = Math.max(3, amp * (h - 16));
        ctx.fillStyle = i % 9 === 4 ? "#8A7DFF" : "rgba(63,224,197," + (0.45 + amp * 0.55) + ")";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x - 1.5, (h - bh) / 2, 3, bh, 2);
        else ctx.rect(x - 1.5, (h - bh) / 2, 3, bh);
        ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  });

  /* Reloj de llamada en las consolas */
  document.querySelectorAll("[data-clock]").forEach((el) => {
    let s = parseInt(el.textContent, 10) || 0;
    if (!reduce) setInterval(() => { s = (s + 1) % 60; el.textContent = String(s).padStart(2, "0"); }, 1000);
  });

  /* Calculadora de llamadas perdidas */
  const L = document.getElementById("cLost"), T = document.getElementById("cTicket"), C = document.getElementById("cClose");
  if (L && T && C) {
    const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
    const calc = () => {
      document.getElementById("oLost").textContent = L.value;
      document.getElementById("oTicket").textContent = fmt.format(T.value);
      document.getElementById("oClose").textContent = C.value;
      const loss = L.value * 4.33 * (C.value / 10) * T.value;
      document.getElementById("rLoss").textContent = fmt.format(Math.round(loss / 100) * 100);
    };
    [L, T, C].forEach((el) => el.addEventListener("input", calc));
    calc();
  }

  /* Plan o giro preseleccionado en el mensaje del formulario */
  const msg = document.getElementById("mensaje");
  const prefill = (text) => { if (msg && !msg.value) msg.value = text; };
  document.querySelectorAll("a[data-plan]").forEach((a) =>
    a.addEventListener("click", () => prefill("Me interesa el plan " + a.dataset.plan + ". "))
  );
  try {
    const params = new URLSearchParams(location.search);
    if (params.get("plan")) prefill("Me interesa el plan " + params.get("plan") + ". ");
    else if (params.get("giro")) prefill("Mi negocio es del giro: " + params.get("giro") + ". ");
  } catch (e) { /* sin parámetros */ }

  /* Formulario de leads (cualquier form.lead-form) */
  document.querySelectorAll("form.lead-form").forEach((form) => {
    const card = form.closest(".form-card");
    const success = card ? card.querySelector(".success") : null;
    const errorBox = form.querySelector(".form-error");
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn ? submitBtn.textContent : "";
    const $ = (name) => form.elements[name];

    const setErr = (name, text) => {
      const el = form.querySelector('[data-for="' + name + '"]');
      const input = $(name);
      if (el) el.textContent = text || "";
      if (input && input.setAttribute) input.setAttribute("aria-invalid", text ? "true" : "false");
    };

    const validate = () => {
      let ok = true;
      const val = (n) => ($(n) ? String($(n).value).trim() : "");
      if (val("nombre").length < 2) { setErr("nombre", "Escribe tu nombre."); ok = false; } else setErr("nombre");
      if (val("empresa").length < 2) { setErr("empresa", "Escribe el nombre de tu negocio."); ok = false; } else setErr("empresa");
      const tel = val("telefono").replace(/\D/g, "").replace(/^52/, "");
      if (tel.length !== 10) { setErr("telefono", "Escribe un número de 10 dígitos, por ejemplo 55 1234 5678."); ok = false; } else setErr("telefono");
      const mail = val("correo");
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { setErr("correo", "Revisa el correo; parece incompleto."); ok = false; } else setErr("correo");
      if (!val("municipio")) { setErr("municipio", "Elige tu municipio."); ok = false; } else setErr("municipio");
      if (!$("privacidad").checked) { setErr("privacidad", "Necesitamos tu aceptación del Aviso de Privacidad para contactarte."); ok = false; } else setErr("privacidad");
      return ok;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.textContent = "";
      if ($("website") && $("website").value) return; // trampa anti-bots
      if (!validate()) {
        const first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }
      const fd = new FormData(form);
      const params = new URLSearchParams(location.search);
      const data = {
        nombre: String(fd.get("nombre") || "").trim(),
        empresa: String(fd.get("empresa") || "").trim(),
        telefono: String(fd.get("telefono") || "").replace(/\D/g, "").replace(/^52/, ""),
        correo: String(fd.get("correo") || "").trim(),
        municipio: fd.get("municipio") || "",
        giro: fd.get("giro") || "",
        llamadas_dia: fd.get("llamadas") || "",
        usos: fd.getAll("uso"),
        mensaje: String(fd.get("mensaje") || "").trim(),
        acepta_aviso: true,
        acepta_marketing: !!fd.get("marketing"),
        origen: form.dataset.origen || "sitio",
        pagina: location.pathname,
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        fecha: new Date().toISOString()
      };
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando…"; }
      try {
        if (WEBHOOK_URL) {
          const r = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
          if (!r.ok) throw new Error("HTTP " + r.status);
        } else {
          console.info("[Galosoft Agentes] Modo demostración. Lead que se enviaría:", data);
        }
        form.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
      } catch (err) {
        if (errorBox) errorBox.textContent = "No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo, o escríbenos a info@galosoftagentes.com.";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = btnText; }
      }
    });
  });

  /* Aviso de privacidad: copiar el texto simplificado */
  const copyBtn = document.getElementById("copyScript");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const box = document.getElementById("scriptText");
      try { await navigator.clipboard.writeText(box.innerText); copyBtn.textContent = "Copiado"; }
      catch (e) {
        const r = document.createRange(); r.selectNodeContents(box);
        const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        copyBtn.textContent = "Texto seleccionado: usa Ctrl+C";
      }
      setTimeout(() => (copyBtn.textContent = "Copiar texto"), 2200);
    });
  }

  /* Aviso de privacidad: ocultar resaltado de campos por completar (solo vista previa) */
  const hideNote = document.getElementById("hideNote");
  if (hideNote) {
    hideNote.addEventListener("click", () => {
      document.querySelectorAll(".fill").forEach((el) => el.classList.add("filled"));
      document.getElementById("editorNote").hidden = true;
    });
  }
})();
