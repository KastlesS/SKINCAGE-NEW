/**
 * login_errors.js
 * Maneja la visualización animada de errores en el formulario de inicio de sesión.
 * Se activa cuando Django devuelve form.errors (credenciales incorrectas).
 */

(function () {
  "use strict";

  const banner = document.getElementById("login-error-banner");
  if (!banner) return; // No hay errores, nada que hacer

  const usernameInput = document.querySelector("#id_username");
  const passwordInput = document.querySelector("#id_password");

  // 1. Animar la entrada del banner (ya visible via CSS animation)
  //    y añadir clase de error a los campos
  [usernameInput, passwordInput].forEach((input) => {
    if (!input) return;
    input.classList.add("input-error");

    // Limpiar clase de error al empezar a escribir
    input.addEventListener(
      "input",
      function clearError() {
        input.classList.remove("input-error");
        // Si ambos campos están limpios, ocultar el banner
        const allClean = ![usernameInput, passwordInput].some((i) =>
          i?.classList.contains("input-error")
        );
        if (allClean) dismissBanner();
      },
      { once: true }
    );
  });

  // 2. Auto-dismiss del banner tras 6 segundos
  const autoDismissTimer = setTimeout(dismissBanner, 6000);

  // 3. Botón de cierre (si existe)
  const closeBtn = banner.querySelector(".login-error-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      clearTimeout(autoDismissTimer);
      dismissBanner();
    });
  }

  function dismissBanner() {
    banner.classList.add("login-error-banner--hiding");
    banner.addEventListener(
      "animationend",
      () => {
        banner.style.display = "none";
      },
      { once: true }
    );
  }
})();
