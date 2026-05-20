document.addEventListener('DOMContentLoaded', function() {
    const userBalanceElement = document.getElementById('user-balance');
    const skinPriceElement = document.getElementById('skin-price');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const balanceWarning = document.getElementById('balance-warning');
    const balanceDiff = document.getElementById('balance-diff');

    if (userBalanceElement && skinPriceElement && btnConfirmar) {
        const balance = parseFloat(userBalanceElement.getAttribute('data-balance').replace(',', '.'));
        const precio = parseFloat(skinPriceElement.value.replace(',', '.'));

        if (balance < precio) {
            btnConfirmar.disabled = true;
            btnConfirmar.style.opacity = '0.5';
            btnConfirmar.style.cursor = 'not-allowed';
            
            const diff = (precio - balance).toFixed(2);
            balanceDiff.textContent = diff;
            balanceWarning.style.display = 'block';
        }
    }
});
