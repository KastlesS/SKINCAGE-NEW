document.addEventListener("DOMContentLoaded", () => {
  const botonesFloat = document.querySelectorAll(".botones-wear button");
  const floatMin = document.querySelector('input[name="float_min"]');
  const floatMax = document.querySelector('input[name="float_max"]');

  const rangos = {
    FN: { min: "0", max: "0.07" },
    MW: { min: "0.07", max: "0.15" },
    FT: { min: "0.15", max: "0.38" },
    WW: { min: "0.38", max: "0.45" },
    BS: { min: "0.45", max: "1" },
  };

  if (botonesFloat.length > 0 && floatMin && floatMax) {
    botonesFloat.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const float = button.textContent.trim();

        if (rangos[float]) {
          floatMin.value = rangos[float].min;
          floatMax.value = rangos[float].max;

          botonesFloat.forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");
        }
      });
    });

    const currentMin = floatMin.value;
    const currentMax = floatMax.value;

    for (const [float, range] of Object.entries(rangos)) {
      if (
        Number(currentMin) === Number(range.min) &&
        Number(currentMax) === Number(range.max)
      ) {
        const btn = Array.from(botonesFloat).find(
          (b) => b.textContent.trim() === float,
        );
        if (btn) btn.classList.add("active");
      }
    }
  }
});
