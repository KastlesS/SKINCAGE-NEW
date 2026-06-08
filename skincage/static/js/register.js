document.addEventListener("DOMContentLoaded", function () {
  const seccionLogin = document.getElementById("seccion-login");
  const seccionRegistro = document.getElementById("seccion-registro");
  const btnMostrarRegistro = document.getElementById("btn-ir-registro");
  const btnMostrarLogin = document.getElementById("btn-ir-login");
  const formularioRegistro = document.getElementById("formulario-registro");
  const errorRegistro = document.getElementById("error-registro");

  function revisarHash() {
    if (window.location.hash === "#register") {
      if (seccionLogin && seccionRegistro) {
        seccionLogin.style.display = "none";
        seccionRegistro.style.display = "block";
      }
    } else if (window.location.hash === "#login" || !window.location.hash) {
      if (seccionLogin && seccionRegistro) {
        seccionRegistro.style.display = "none";
        seccionLogin.style.display = "block";
      }
    }
  }

  if (btnMostrarRegistro) {
    btnMostrarRegistro.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.hash = "#register";
    });
  }

  if (btnMostrarLogin) {
    btnMostrarLogin.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.hash = "#login";
    });
  }

  revisarHash();
  window.addEventListener("hashchange", revisarHash);

  if (formularioRegistro) {
    formularioRegistro.addEventListener("submit", function (e) {
      e.preventDefault();

      const usuario = document.getElementById("reg_username").value.trim();
      const correo = document.getElementById("reg_email").value.trim();
      const contrasena = document.getElementById("reg_password").value;

      const tokenCsrf =
        document.getElementById("reg-csrf").value ||
        document.querySelector("[name=csrfmiddlewaretoken]").value;

      errorRegistro.style.display = "none";
      errorRegistro.innerText = "";

      if (!usuario) {
        errorRegistro.style.display = "block";
        errorRegistro.innerText = "El nombre de usuario es obligatorio.";
        return;
      }

      fetch("/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": tokenCsrf,
        },
        body: JSON.stringify({
          username: usuario,
          email: correo,
          password: contrasena,
        }),
      })
        .then((res) => res.json())
        .then((respuesta) => {
          if (respuesta.success) {
            window.location.href = respuesta.redirect_url || "/";
          } else {
            errorRegistro.style.display = "block";
            errorRegistro.innerText =
              respuesta.error || "Ocurrió un error al registrarse.";
          }
        })
        .catch((err) => {
          console.error("Error:", err);
          errorRegistro.style.display = "block";
          errorRegistro.innerText = "Error de conexión. Inténtalo de nuevo.";
        });
    });
  }
});
