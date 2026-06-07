document.addEventListener('DOMContentLoaded', function () {
    const userBalanceEl = document.getElementById('user-balance');
    const skinPriceEl   = document.getElementById('skin-price');
    const duracionEl    = document.getElementById('duracion');
    const btnConfirmar  = document.getElementById('btn-confirmar');
    const balanceWarning = document.getElementById('balance-warning');
    const balanceDiffEl  = document.getElementById('balance-diff');

    const precioBaseDisplay   = document.getElementById('precio-base-display');
    const precioRecargoDisplay = document.getElementById('precio-recargo-display');
    const precioTotalDisplay  = document.getElementById('precio-total-display');

    // Leer multiplicadores inyectados desde Django
    let multiplicadores = {};
    try {
        const raw = document.getElementById('multiplicadores-data').textContent;
        multiplicadores = JSON.parse(raw);
    } catch (e) {
        // Fallback por defecto si no se puede parsear
        multiplicadores = { '1': 1.0, '6': 1.1, '12': 1.15, '24': 1.25, '48': 1.4, '72': 1.6 };
    }

    if (!userBalanceEl || !skinPriceEl || !duracionEl) return;

    const balance    = parseFloat(userBalanceEl.getAttribute('data-balance').replace(',', '.'));
    const precioBase = parseFloat(skinPriceEl.value.replace(',', '.'));

    function calcularPrecioTotal(horas) {
        const mult = multiplicadores[String(horas)] ?? 1.25;
        return parseFloat((precioBase * mult).toFixed(2));
    }

    function actualizarUI() {
        const horas       = parseInt(duracionEl.value, 10);
        const total       = calcularPrecioTotal(horas);
        const recargo     = parseFloat((total - precioBase).toFixed(2));
        const mult        = multiplicadores[String(horas)] ?? 1.25;
        const porcentaje  = Math.round((mult - 1) * 100);

        // Actualizar displays
        precioBaseDisplay.textContent    = precioBase.toFixed(2) + ' €';
        precioRecargoDisplay.textContent = '+' + recargo.toFixed(2) + ' €' +
            (porcentaje > 0 ? ' (+' + porcentaje + '%)' : '');
        precioTotalDisplay.textContent   = total.toFixed(2) + ' €';

        // Clase visual para el recargo
        precioRecargoDisplay.classList.toggle('recargo-cero', recargo === 0);

        // Verificar balance
        if (balance < total) {
            const diff = (total - balance).toFixed(2);
            balanceDiffEl.textContent = diff;
            balanceWarning.style.display = 'block';
            btnConfirmar.disabled = true;
            btnConfirmar.style.opacity = '0.5';
            btnConfirmar.style.cursor  = 'not-allowed';
        } else {
            balanceWarning.style.display = 'none';
            btnConfirmar.disabled = false;
            btnConfirmar.style.opacity = '1';
            btnConfirmar.style.cursor  = 'pointer';
        }
    }

    // Inicializar al cargar
    actualizarUI();

    // Recalcular al cambiar duración
    duracionEl.addEventListener('change', actualizarUI);
});
