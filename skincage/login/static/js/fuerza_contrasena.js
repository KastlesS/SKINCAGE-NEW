document.addEventListener("DOMContentLoaded", function () {
  const campoPwd = document.getElementById("id_nueva_contrasena");
  if (!campoPwd) return;

  const barras = [
    document.getElementById("barra-1"),
    document.getElementById("barra-2"),
    document.getElementById("barra-3"),
    document.getElementById("barra-4"),
  ];

  const coloresFuerza = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  function calcularFuerza(pwd) {
    let puntos = 0;
    if (pwd.length >= 8) puntos++;
    if (pwd.length >= 12) puntos++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) puntos++;
    if (/[0-9]/.test(pwd)) puntos++;
    if (/[^A-Za-z0-9]/.test(pwd)) puntos++;
    return Math.min(4, Math.ceil((puntos * 4) / 5));
  }

  campoPwd.addEventListener("input", () => {
    const nivel = calcularFuerza(campoPwd.value);
    barras.forEach((barra, i) => {
      barra.style.background =
        i < nivel ? coloresFuerza[nivel - 1] : "rgba(255,255,255,0.08)";
    });
  });
});
