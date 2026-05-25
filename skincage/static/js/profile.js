/* =========================================================
   profile.js — Lógica de la página de perfil de usuario
   ========================================================= */

(function () {

  // ─── Avatar preview & upload ───────────────────────────
  const avatarBtn         = document.getElementById('avatar-btn');
  const avatarInput       = document.getElementById('avatar-input');
  const avatarPreview     = document.getElementById('avatar-preview');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');

  if (avatarBtn) {
    avatarBtn.addEventListener('click', () => avatarInput.click());
  }

  if (avatarInput) {
    avatarInput.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        avatarPreview.src = e.target.result;
        avatarPreview.style.display = 'block';
        avatarPreview.classList.add('profile-avatar');
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });
  }


  // ─── Formulario de perfil ──────────────────────────────
  const profileForm = document.getElementById('profile-form');
  const feedback    = document.getElementById('profile-feedback');

  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData  = new FormData();
      formData.append('username',   document.getElementById('pf-username').value.trim());
      formData.append('first_name', document.getElementById('pf-first-name').value.trim());
      const csrfToken = profileForm.querySelector('[name=csrfmiddlewaretoken]').value;

      if (avatarInput && avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
      }

      feedback.style.display = 'none';
      feedback.className = 'profile-feedback';

      fetch(PROFILE_UPDATE_URL, {
        method:  'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body:    formData,
      })
        .then(r => r.json())
        .then(data => {
          feedback.style.display = 'block';
          if (data.success) {
            feedback.classList.add('success');
            feedback.textContent = data.message || 'Guardado correctamente.';
          } else {
            feedback.classList.add('error');
            feedback.textContent = data.error || 'Error al guardar.';
          }
        })
        .catch(() => {
          feedback.style.display = 'block';
          feedback.classList.add('error');
          feedback.textContent = 'Error de conexión.';
        });
    });
  }


  // ─── Countdown + bloqueo de cancelación (5 min) ────────
  const CANCEL_WINDOW_MS = 5 * 60 * 1000; // 5 minutos en ms

  function updateCountdowns() {
    const timers = document.querySelectorAll('.countdown-timer');
    const now    = Date.now(); // ms since epoch

    timers.forEach(timer => {
      // data-expiracion contiene Unix timestamp en segundos (filtro Django |date:'U')
      const expMs  = parseInt(timer.getAttribute('data-expiracion'), 10) * 1000;
      const diffMs = expMs - now;

      if (isNaN(diffMs) || diffMs <= 0) {
        timer.textContent = 'Expirada';
        timer.style.color = '#ef4444';
      } else {
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours        = Math.floor(totalSeconds / 3600);
        const minutes      = Math.floor((totalSeconds % 3600) / 60);
        const seconds      = totalSeconds % 60;

        timer.textContent =
          String(hours).padStart(2, '0')   + ':' +
          String(minutes).padStart(2, '0') + ':' +
          String(seconds).padStart(2, '0');
      }
    });
  }

  /**
   * Por cada botón de cancelar, calcula cuántos ms faltan para
   * cumplir los 5 min desde la reserva y programa un setTimeout
   * que lo oculta exactamente en ese instante.
   * Si ya han pasado los 5 min cuando carga la página, lo oculta ya.
   */
  function scheduleCancelExpiry() {
    const cancelBtns = document.querySelectorAll('.btn-cancel-reserva');
    const now = Date.now();

    cancelBtns.forEach(btn => {
      // data-fecha-reserva contiene Unix timestamp en segundos
      const fechaMs   = parseInt(btn.getAttribute('data-fecha-reserva'), 10) * 1000;
      const expiresAt = fechaMs + CANCEL_WINDOW_MS;
      const msLeft    = expiresAt - now;

      function hideCancelBtn() {
        btn.style.display = 'none';
      }

      if (isNaN(msLeft) || msLeft <= 0) {
        hideCancelBtn();
      } else {
        setTimeout(hideCancelBtn, msLeft);
      }
    });
  }

  if (document.querySelectorAll('.countdown-timer').length > 0) {
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
  }

  if (document.querySelectorAll('.btn-cancel-reserva').length > 0) {
    scheduleCancelExpiry();
  }


  // ─── Añadir Balance (Simulado) ─────────────────────────
  const balancePresets    = document.querySelectorAll('.btn-balance-preset');
  const btnAddCustom      = document.getElementById('btn-add-custom');
  const customBalanceInput = document.getElementById('custom-balance-input');
  const balanceFeedback   = document.getElementById('balance-feedback');

  function addBalance(amount) {
    if (!amount || amount <= 0) return;
    balanceFeedback.style.display = 'none';
    balanceFeedback.className = 'profile-feedback';
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    fetch('/api/users/balance/add/', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken':  csrfToken,
      },
      body: JSON.stringify({ amount }),
    })
      .then(r => r.json().then(data => ({ status: r.status, body: data })))
      .then(res => {
        balanceFeedback.style.display = 'block';
        if (res.status === 200 && res.body.success) {
          balanceFeedback.classList.add('success');
          balanceFeedback.textContent = res.body.message;
          const balanceSpan = document.querySelector('.profile-balance-badge strong');
          if (balanceSpan) {
            balanceSpan.textContent = parseFloat(res.body.new_balance).toFixed(2) + ' €';
          }
        } else {
          balanceFeedback.classList.add('error');
          balanceFeedback.textContent = res.body.error || 'Error al añadir fondos.';
        }
      })
      .catch(() => {
        balanceFeedback.style.display = 'block';
        balanceFeedback.classList.add('error');
        balanceFeedback.textContent = 'Error de conexión.';
      });
  }

  balancePresets.forEach(btn => {
    btn.addEventListener('click', function () {
      addBalance(this.getAttribute('data-amount'));
    });
  });

  if (btnAddCustom) {
    btnAddCustom.addEventListener('click', function () {
      addBalance(customBalanceInput.value);
    });
  }

})();
