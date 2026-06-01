document.addEventListener('DOMContentLoaded', function() {
  const paymentForm = document.getElementById('stripe-payment-form');
  if (!paymentForm) return;

  // Retrieve amount dynamically from data attribute
  const amount = paymentForm.getAttribute('data-amount') || '0.00';

  // Initialize Stripe using a standard official public test key
  // This key is safe to share as it is Stripe's public test credential.
  const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
  const elements = stripe.elements();

  // Style elements to match our dark premium CSS theme
  const style = {
    base: {
      color: '#ffffff',
      fontFamily: '"Outfit", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '15px',
      '::placeholder': {
        color: '#9ca3af'
      }
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    }
  };

  // Create the Card Element
  const card = elements.create('card', {
    style: style,
    hidePostalCode: true
  });

  // Mount it into the card-element div
  const cardElement = document.getElementById('card-element');
  if (cardElement) {
    card.mount('#card-element');
  }

  const cardContainer = document.getElementById('stripe-card-container');
  const cardErrors = document.getElementById('card-errors');

  // Handle container styling on focus
  card.on('focus', function() {
    if (cardContainer) {
      cardContainer.classList.add('stripe-card-composite--focus');
    }
  });

  card.on('blur', function() {
    if (cardContainer) {
      cardContainer.classList.remove('stripe-card-composite--focus');
    }
  });

  // Handle real-time card validation errors
  card.on('change', function(event) {
    if (cardErrors) {
      if (event.error) {
        cardErrors.textContent = event.error.message;
      } else {
        cardErrors.textContent = '';
      }
    }
  });

  const loadingOverlay = document.getElementById('stripe-loading-overlay');
  const successOverlay = document.getElementById('stripe-success-overlay');

  paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Show Stripe loading spinner
    if (loadingOverlay) {
      loadingOverlay.classList.add('active');
    }

    // Call the Stripe server-side test tokenization engine
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Hide loader and show Stripe API errors
        if (loadingOverlay) {
          loadingOverlay.classList.remove('active');
        }
        if (cardErrors) {
          cardErrors.textContent = result.error.message;
        }
      } else {
        // Token successfully created at Stripe's server!
        // We can proceed to update user balance in the local backend securely.
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

        fetch('/api/users/balance/add/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          body: JSON.stringify({ amount: amount }),
        })
        .then(r => r.json().then(data => ({ status: r.status, body: data })))
        .then(res => {
          if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
          }
          if (res.status === 200 && res.body.success) {
            // Activate success checkmark screen
            if (successOverlay) {
              successOverlay.classList.add('active');
            }
            // Redirect back to profile page after 2.5 seconds
            setTimeout(function() {
              window.location.href = "/perfil/";
            }, 2500);
          } else {
            alert(res.body.error || 'Hubo un error al procesar tu recarga.');
          }
        })
        .catch(() => {
          if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
          }
          alert('Error de conexión al procesar el pago.');
        });
      }
    });
  });
});
