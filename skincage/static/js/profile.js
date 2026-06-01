/* =========================================================
   profile.js — Lógica de la página de perfil de usuario
   ========================================================= */

(function () {
  // ─── Avatar preview & upload ───────────────────────────
  const avatarBtn = document.getElementById("avatar-btn");
  const avatarInput = document.getElementById("avatar-input");
  const avatarPreview = document.getElementById("avatar-preview");
  const avatarPlaceholder = document.getElementById("avatar-placeholder");

  if (avatarBtn) {
    avatarBtn.addEventListener("click", () => avatarInput.click());
  }

  if (avatarInput) {
    avatarInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        avatarPreview.src = e.target.result;
        avatarPreview.style.display = "block";
        avatarPreview.classList.add("profile-avatar");
        if (avatarPlaceholder) avatarPlaceholder.style.display = "none";
      };
      reader.readAsDataURL(file);
    });
  }

  // ─── Formulario de perfil ──────────────────────────────
  const profileForm = document.getElementById("profile-form");
  const feedback = document.getElementById("profile-feedback");

  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData();
      formData.append(
        "username",
        document.getElementById("pf-username").value.trim(),
      );
      formData.append(
        "first_name",
        document.getElementById("pf-first-name").value.trim(),
      );
      const csrfToken = profileForm.querySelector(
        "[name=csrfmiddlewaretoken]",
      ).value;

      if (avatarInput && avatarInput.files[0]) {
        formData.append("avatar", avatarInput.files[0]);
      }

      feedback.style.display = "none";
      feedback.className = "profile-feedback";

      fetch(PROFILE_UPDATE_URL, {
        method: "POST",
        headers: { "X-CSRFToken": csrfToken },
        body: formData,
      })
        .then((r) => r.json())
        .then((data) => {
          feedback.style.display = "block";
          if (data.success) {
            feedback.classList.add("success");
            feedback.textContent = data.message || "Guardado correctamente.";
          } else {
            feedback.classList.add("error");
            feedback.textContent = data.error || "Error al guardar.";
          }
        })
        .catch(() => {
          feedback.style.display = "block";
          feedback.classList.add("error");
          feedback.textContent = "Error de conexión.";
        });
    });
  }

  // ─── Countdown + bloqueo de cancelación (5 min) ────────
  const CANCEL_WINDOW_MS = 5 * 60 * 1000; // 5 minutos en ms

  /**
   * Fase 1 (primeros 5 min): muestra cuenta atrás para cancelar (MM:SS).
   * Fase 2 (después de 5 min): muestra tiempo restante de reserva (HH:MM:SS).
   * Cuando llega a 0 la Fase 2, muestra "Expirada".
   */
  function updateCancelCountdowns() {
    const timers = document.querySelectorAll(".countdown-cancel-timer");
    const now = Date.now();

    timers.forEach((timer) => {
      const fechaMs =
        parseInt(timer.getAttribute("data-fecha-reserva"), 10) * 1000;
      const cancelExp = fechaMs + CANCEL_WINDOW_MS;
      const cancelDiffMs = cancelExp - now;

      const reservaId = timer.getAttribute("data-reserva-id");
      const cancelBtn = reservaId
        ? document.querySelector(
            `.btn-cancel-reserva[data-reserva-id="${reservaId}"]`,
          )
        : null;

      if (!isNaN(cancelDiffMs) && cancelDiffMs > 0) {
        // ── FASE 1: ventana de cancelación activa ────────────
        const totalSecs = Math.floor(cancelDiffMs / 1000);
        const minutes = Math.floor(totalSecs / 60);
        const seconds = totalSecs % 60;

        timer.textContent =
          String(minutes).padStart(2, "0") +
          ":" +
          String(seconds).padStart(2, "0");
        timer.title = "Tiempo restante para poder cancelar";

        if (totalSecs <= 60) {
          timer.style.color = "#ef4444"; // rojo: menos de 1 min
        } else if (totalSecs <= 120) {
          timer.style.color = "#f59e0b"; // ámbar: menos de 2 min
        } else {
          timer.style.color = "#22c55e"; // verde: tiempo suficiente
        }

        // Botón habilitado durante la ventana de cancelación
        if (cancelBtn) {
          cancelBtn.disabled = false;
          cancelBtn.title = "";
          cancelBtn.style.opacity = "1";
          cancelBtn.style.cursor = "pointer";
          cancelBtn.style.background = "#ef4444";
        }
      } else {
        // ── FASE 2: ventana de cancelación agotada, deshabilitar botón ──
        if (cancelBtn) {
          cancelBtn.disabled = true;
          cancelBtn.title = "El tiempo para cancelar ha expirado";
          cancelBtn.style.opacity = "0.4";
          cancelBtn.style.cursor = "not-allowed";
          cancelBtn.style.background = "#6b7280";
        }

        // Mostrar tiempo restante de la reserva completa
        const expiracionMs =
          parseInt(timer.getAttribute("data-expiracion"), 10) * 1000;
        const reservaDiffMs = expiracionMs - now;

        if (isNaN(reservaDiffMs) || reservaDiffMs <= 0) {
          timer.textContent = "Expirada";
          timer.style.color = "#6b7280";
          timer.title = "La reserva ha expirado";
        } else {
          const totalSecs = Math.floor(reservaDiffMs / 1000);
          const hours = Math.floor(totalSecs / 3600);
          const minutes = Math.floor((totalSecs % 3600) / 60);
          const seconds = totalSecs % 60;

          timer.textContent =
            String(hours).padStart(2, "0") +
            ":" +
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
          timer.style.color = "var(--accent-glow, #a78bfa)";
          timer.title = "Tiempo restante de reserva";
        }
      }
    });
  }

  const cancelTimers = document.querySelectorAll(".countdown-cancel-timer");
  if (cancelTimers.length > 0) {
    updateCancelCountdowns();
    setInterval(updateCancelCountdowns, 1000);
  }

  // ─── Añadir Balance (Simulado) ─────────────────────────
  const balancePresets = document.querySelectorAll(".btn-balance-preset");
  const btnAddCustom = document.getElementById("btn-add-custom");
  const customBalanceInput = document.getElementById("custom-balance-input");
  const balanceFeedback = document.getElementById("balance-feedback");

  function addBalance(amount) {
    if (!amount || amount <= 0) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      if (balanceFeedback) {
        balanceFeedback.style.display = 'block';
        balanceFeedback.className = 'profile-feedback error';
        balanceFeedback.textContent = 'Por favor introduce una cantidad válida.';
      }
      return;
    }
    // Redirigir a la página oficial simulada con Stripe.js
    window.location.href = `/perfil/recargar/?amount=${parsedAmount.toFixed(2)}`;
  }

  balancePresets.forEach((btn) => {
    btn.addEventListener("click", function () {
      addBalance(this.getAttribute("data-amount"));
    });
  });

  if (btnAddCustom) {
    btnAddCustom.addEventListener("click", function () {
      addBalance(customBalanceInput.value);
    });
  }
})();
