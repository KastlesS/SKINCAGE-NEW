(function () {
  "use strict";

  const aviso = document.getElementById("aviso-credenciales");
  if (!aviso) return;
  const campoUsuario = document.querySelector("#id_username");
  const campoContrasena = document.querySelector("#id_password");

  [campoUsuario, campoContrasena].forEach((campo) => {
    if (!campo) return;
    campo.classList.add("campo-error");

    campo.addEventListener(
      "input",
      function quitarError() {
        campo.classList.remove("campo-error");
        const todoLimpio = ![campoUsuario, campoContrasena].some((c) =>
          c?.classList.contains("campo-error"),
        );
        if (todoLimpio) ocultarAviso();
      },
      { once: true },
    );
  });

  const temporizadorOcultar = setTimeout(ocultarAviso, 6000);

  const btnCerrar = aviso.querySelector(".btn-cerrar-aviso");
  if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
      clearTimeout(temporizadorOcultar);
      ocultarAviso();
    });
  }

  function ocultarAviso() {
    aviso.classList.add("aviso-credenciales--ocultando");
    aviso.addEventListener(
      "animationend",
      () => {
        aviso.style.display = "none";
      },
      { once: true },
    );
  }
})();
