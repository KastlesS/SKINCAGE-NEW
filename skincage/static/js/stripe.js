document.addEventListener("DOMContentLoaded", function () {
  const formularioPago = document.getElementById("stripe-payment-form");
  if (!formularioPago) return;

  const importe = formularioPago.getAttribute("data-amount") || "0.00";

  const stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx");
  const elementosStripe = stripe.elements();

  const estilosTarjeta = {
    base: {
      color: "#ffffff",
      fontFamily: '"Outfit", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "15px",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  };

  const tarjeta = elementosStripe.create("card", {
    style: estilosTarjeta,
    hidePostalCode: true,
  });

  const contenedorTarjeta = document.getElementById("card-element");
  if (contenedorTarjeta) {
    tarjeta.mount("#card-element");
  }

  const marcoTarjeta = document.getElementById("stripe-card-container");
  const avisoError = document.getElementById("card-errors");

  tarjeta.on("focus", function () {
    if (marcoTarjeta) {
      marcoTarjeta.classList.add("stripe-card-composite--focus");
    }
  });

  tarjeta.on("blur", function () {
    if (marcoTarjeta) {
      marcoTarjeta.classList.remove("stripe-card-composite--focus");
    }
  });

  tarjeta.on("change", function (evento) {
    if (avisoError) {
      if (evento.error) {
        avisoError.textContent = evento.error.message;
      } else {
        avisoError.textContent = "";
      }
    }
  });

  const pantallaEspera = document.getElementById("stripe-loading-overlay");
  const pantallaExito = document.getElementById("stripe-success-overlay");

  formularioPago.addEventListener("submit", function (e) {
    e.preventDefault();

    if (pantallaEspera) {
      pantallaEspera.classList.add("active");
    }

    stripe.createToken(tarjeta).then(function (resultado) {
      if (resultado.error) {
        if (pantallaEspera) {
          pantallaEspera.classList.remove("active");
        }
        if (avisoError) {
          avisoError.textContent = resultado.error.message;
        }
      } else {
        const tokenCsrf =
          document.querySelector("[name=csrfmiddlewaretoken]")?.value || "";

        fetch("/api/users/balance/add/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": tokenCsrf,
          },
          body: JSON.stringify({ amount: importe }),
        })
          .then((r) =>
            r.json().then((datos) => ({ estado: r.status, cuerpo: datos })),
          )
          .then((res) => {
            if (pantallaEspera) {
              pantallaEspera.classList.remove("active");
            }
            if (res.estado === 200 && res.cuerpo.success) {
              if (pantallaExito) {
                pantallaExito.classList.add("active");
              }
              setTimeout(function () {
                window.location.href = "/perfil/";
              }, 2500);
            } else {
              alert(
                res.cuerpo.error || "Hubo un error al procesar tu recarga.",
              );
            }
          })
          .catch(() => {
            if (pantallaEspera) {
              pantallaEspera.classList.remove("active");
            }
            alert("Error de conexión al procesar el pago.");
          });
      }
    });
  });
});
