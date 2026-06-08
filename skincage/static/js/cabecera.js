(function () {
  var botonMenu = document.getElementById("boton-menu");
  var envoltorioNav = document.getElementById("envoltura-nav");
  if (!botonMenu || !envoltorioNav) return;

  botonMenu.addEventListener("click", function () {
    var abierto = envoltorioNav.classList.toggle("abierto");
    botonMenu.classList.toggle("activo", abierto);
    botonMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  envoltorioNav.querySelectorAll(".enlace-nav").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
      envoltorioNav.classList.remove("abierto");
      botonMenu.classList.remove("activo");
      botonMenu.setAttribute("aria-expanded", "false");
    });
  });
})();
