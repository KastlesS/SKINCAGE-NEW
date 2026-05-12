document.addEventListener("DOMContentLoaded", function() {
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("register-section");
    const showRegisterBtn = document.getElementById("show-register");
    const showLoginBtn = document.getElementById("show-login");
    const registerForm = document.getElementById("register-form");
    const registerError = document.getElementById("register-error");

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener("click", function(e) {
            e.preventDefault();
            loginSection.style.display = "none";
            registerSection.style.display = "block";
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener("click", function(e) {
            e.preventDefault();
            registerSection.style.display = "none";
            loginSection.style.display = "block";
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const username = document.getElementById("reg_username").value.trim();
            const email = document.getElementById("reg_email").value.trim();
            const password = document.getElementById("reg_password").value;
            // Get CSRF from the hidden field inside the register form
            const csrfToken = document.getElementById("reg-csrf").value
                || document.querySelector('[name=csrfmiddlewaretoken]').value;

            registerError.style.display = "none";
            registerError.innerText = "";

            if (!username) {
                registerError.style.display = "block";
                registerError.innerText = "El nombre de usuario es obligatorio.";
                return;
            }

            fetch("/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({ username: username, email: email, password: password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect_url || "/";
                } else {
                    registerError.style.display = "block";
                    registerError.innerText = data.error || "Ocurrió un error al registrarse.";
                }
            })
            .catch(error => {
                console.error("Error:", error);
                registerError.style.display = "block";
                registerError.innerText = "Error de conexión. Inténtalo de nuevo.";
            });
        });
    }
});

