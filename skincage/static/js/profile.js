(function () {
  const btnAvatar = document.getElementById("avatar-btn");
  const inputAvatar = document.getElementById("avatar-input");
  const previaAvatar = document.getElementById("avatar-preview");
  const placeholder = document.getElementById("avatar-placeholder");

  if (btnAvatar) {
    btnAvatar.addEventListener("click", () => inputAvatar.click());
  }

  if (inputAvatar) {
    inputAvatar.addEventListener("change", function () {
      const archivo = this.files[0];
      if (!archivo) return;
      const lector = new FileReader();
      lector.onload = function (e) {
        previaAvatar.src = e.target.result;
        previaAvatar.style.display = "block";
        previaAvatar.classList.add("profile-avatar");
        if (placeholder) placeholder.style.display = "none";
      };
      lector.readAsDataURL(archivo);
    });
  }

  const formularioPerfil = document.getElementById("profile-form");
  const mensajeEstado = document.getElementById("profile-feedback");

  if (formularioPerfil) {
    formularioPerfil.addEventListener("submit", function (e) {
      e.preventDefault();

      const datos = new FormData();
      datos.append(
        "username",
        document.getElementById("pf-username").value.trim(),
      );
      datos.append(
        "first_name",
        document.getElementById("pf-first-name").value.trim(),
      );
      const tokenCsrf = formularioPerfil.querySelector(
        "[name=csrfmiddlewaretoken]",
      ).value;

      if (inputAvatar && inputAvatar.files[0]) {
        datos.append("avatar", inputAvatar.files[0]);
      }

      mensajeEstado.style.display = "none";
      mensajeEstado.className = "profile-feedback";

      fetch(PROFILE_UPDATE_URL, {
        method: "POST",
        headers: { "X-CSRFToken": tokenCsrf },
        body: datos,
      })
        .then((r) => r.json())
        .then((respuesta) => {
          mensajeEstado.style.display = "block";
          if (respuesta.success) {
            mensajeEstado.classList.add("success");
            mensajeEstado.textContent =
              respuesta.message || "Guardado correctamente.";
          } else {
            mensajeEstado.classList.add("error");
            mensajeEstado.textContent = respuesta.error || "Error al guardar.";
          }
        })
        .catch(() => {
          mensajeEstado.style.display = "block";
          mensajeEstado.classList.add("error");
          mensajeEstado.textContent = "Error de conexión.";
        });
    });
  }

  const VENTANA_CANCELACION_MS = 5 * 60 * 1000;

  function actualizarCuentasAtras() {
    const contadores = document.querySelectorAll(".countdown-cancel-timer");
    const ahora = Date.now();

    contadores.forEach((contador) => {
      const fechaMs =
        parseInt(contador.getAttribute("data-fecha-reserva"), 10) * 1000;
      const expiraCancelacion = fechaMs + VENTANA_CANCELACION_MS;
      const msHastaCancelacion = expiraCancelacion - ahora;

      const idReserva = contador.getAttribute("data-reserva-id");
      const btnCancelar = idReserva
        ? document.querySelector(
            `.btn-cancel-reserva[data-reserva-id="${idReserva}"]`,
          )
        : null;

      if (!isNaN(msHastaCancelacion) && msHastaCancelacion > 0) {
        const segsTotal = Math.floor(msHastaCancelacion / 1000);
        const minutos = Math.floor(segsTotal / 60);
        const segundos = segsTotal % 60;

        contador.textContent =
          String(minutos).padStart(2, "0") +
          ":" +
          String(segundos).padStart(2, "0");
        contador.title = "Tiempo restante para poder cancelar";

        if (segsTotal <= 60) {
          contador.style.color = "#ef4444";
        } else if (segsTotal <= 120) {
          contador.style.color = "#f59e0b";
        } else {
          contador.style.color = "#22c55e";
        }

        if (btnCancelar) {
          btnCancelar.disabled = false;
          btnCancelar.title = "";
          btnCancelar.style.opacity = "1";
          btnCancelar.style.cursor = "pointer";
          btnCancelar.style.background = "#ef4444";
        }
      } else {
        if (btnCancelar) {
          btnCancelar.disabled = true;
          btnCancelar.title = "El tiempo para cancelar ha expirado";
          btnCancelar.style.opacity = "0.4";
          btnCancelar.style.cursor = "not-allowed";
          btnCancelar.style.background = "#6b7280";
        }

        const msExpiracion =
          parseInt(contador.getAttribute("data-expiracion"), 10) * 1000;
        const msReserva = msExpiracion - ahora;

        if (isNaN(msReserva) || msReserva <= 0) {
          contador.textContent = "Expirada";
          contador.style.color = "#6b7280";
          contador.title = "La reserva ha expirado";
        } else {
          const segsTotal = Math.floor(msReserva / 1000);
          const horas = Math.floor(segsTotal / 3600);
          const minutos = Math.floor((segsTotal % 3600) / 60);
          const segundos = segsTotal % 60;

          contador.textContent =
            String(horas).padStart(2, "0") +
            ":" +
            String(minutos).padStart(2, "0") +
            ":" +
            String(segundos).padStart(2, "0");
          contador.style.color = "var(--accent-glow, #a78bfa)";
          contador.title = "Tiempo restante de reserva";
        }
      }
    });
  }

  const contadoresCancelacion = document.querySelectorAll(
    ".countdown-cancel-timer",
  );
  if (contadoresCancelacion.length > 0) {
    actualizarCuentasAtras();
    setInterval(actualizarCuentasAtras, 1000);
  }

  const botonesPreset = document.querySelectorAll(".btn-balance-preset");
  const btnPersonalizado = document.getElementById("btn-add-custom");
  const inputCantidad = document.getElementById("custom-balance-input");
  const mensajeSaldo = document.getElementById("balance-feedback");

  function recargarSaldo(cantidad) {
    if (!cantidad || cantidad <= 0) return;
    const cantidadNumerica = parseFloat(cantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      if (mensajeSaldo) {
        mensajeSaldo.style.display = "block";
        mensajeSaldo.className = "profile-feedback error";
        mensajeSaldo.textContent = "Por favor introduce una cantidad válida.";
      }
      return;
    }
    window.location.href = `/perfil/recargar/?amount=${cantidadNumerica.toFixed(2)}`;
  }

  botonesPreset.forEach((btn) => {
    btn.addEventListener("click", function () {
      recargarSaldo(this.getAttribute("data-amount"));
    });
  });

  if (btnPersonalizado) {
    btnPersonalizado.addEventListener("click", function () {
      recargarSaldo(inputCantidad.value);
    });
  }
})();
