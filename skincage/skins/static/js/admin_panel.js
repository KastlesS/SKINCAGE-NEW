document.addEventListener("DOMContentLoaded", () => {
    const botonesPestana = document.querySelectorAll(".tab-btn");
    const contenidosPestana = document.querySelectorAll(".tab-content");

    botonesPestana.forEach((btn) => {
        btn.addEventListener("click", () => {
            botonesPestana.forEach((b) => b.classList.remove("active"));
            contenidosPestana.forEach((c) => c.classList.remove("active"));

            btn.classList.add("active");
            const destino = document.getElementById(btn.getAttribute("data-target"));
            if (destino) destino.classList.add("active");
        });
    });

    fetchUsuarios();
    fetchReservas();
    fetchSkins();
});

function vaciarContenedor(contenedor) {
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }
}

function crearItemError(mensaje) {
    const li = document.createElement("li");
    li.className = "data-item";
    li.style.color = "#e74c3c";
    li.textContent = `Error: ${mensaje}`;
    return li;
}

function crearItemVacio(mensaje) {
    const li = document.createElement("li");
    li.className = "data-item";
    const span = document.createElement("span");
    span.style.color = "#8b8b9e";
    span.textContent = mensaje;
    li.appendChild(span);
    return li;
}

async function fetchUsuarios() {
    const contenedor = document.getElementById("users-container");
    const contadorUsuarios = document.getElementById("stat-users");
    try {
        const peticion = await fetch("/api/users/all/");
        if (!peticion.ok) throw new Error("Error al cargar usuarios");
        const usuarios = await peticion.json();

        contadorUsuarios.textContent = usuarios.length;
        vaciarContenedor(contenedor);

        if (usuarios.length === 0) {
            contenedor.appendChild(crearItemVacio("No hay usuarios registrados."));
            return;
        }

        usuarios.forEach((usuario) => {
            const li = document.createElement("li");
            li.className = "data-item";

            const fila = document.createElement("div");
            fila.className = "flex-row";

            const nombreSpan = document.createElement("span");
            nombreSpan.className = "item-title";
            nombreSpan.textContent = usuario.username;
            fila.appendChild(nombreSpan);

            const etiquetaRol = document.createElement("span");
            etiquetaRol.className = usuario.is_staff ? "badge admin" : "badge";
            etiquetaRol.textContent = usuario.is_staff ? "Admin" : "Usuario";
            fila.appendChild(etiquetaRol);

            li.appendChild(fila);

            const subtituloSpan = document.createElement("span");
            subtituloSpan.className = "item-subtitle";
            const fechaRegistro = new Date(usuario.date_joined).toLocaleDateString();
            const correo = usuario.email ? usuario.email : "Sin correo electrónico";

            const saldoTexto = usuario.balance !== undefined ? ` • Balance: ${usuario.balance}€` : "";

            subtituloSpan.textContent = `${correo} • Registrado: ${fechaRegistro}${saldoTexto}`;
            li.appendChild(subtituloSpan);

            contenedor.appendChild(li);
        });
    } catch (fallo) {
        contadorUsuarios.textContent = "Error";
        vaciarContenedor(contenedor);
        contenedor.appendChild(crearItemError(fallo.message));
    }
}

async function fetchReservas() {
    const contenedor = document.getElementById("reservas-container");
    const contadorReservas = document.getElementById("stat-reservas");
    try {
        const peticion = await fetch("/api/reservas/");
        if (!peticion.ok) throw new Error("Error al cargar reservas");
        const reservas = await peticion.json();

        const lista = reservas.results || reservas;
        const activas = lista.filter((r) => r.estado === "confirmada").length;
        contadorReservas.textContent = activas;

        vaciarContenedor(contenedor);

        if (!lista || lista.length === 0) {
            contenedor.appendChild(crearItemVacio("No hay reservas en el sistema."));
            return;
        }

        lista.forEach((reserva) => {
            const li = document.createElement("li");
            li.className = "data-item";

            const fila = document.createElement("div");
            fila.className = "flex-row";

            const nombreSkin = reserva.skin
                ? reserva.skin.nombre || `Skin ID: ${reserva.skin}`
                : "Skin Desconocida";
            const tituloSpan = document.createElement("span");
            tituloSpan.className = "item-title";
            const nombreUsuario = reserva.usuario
                ? reserva.usuario.username || `Usuario #${reserva.usuario}`
                : "Desconocido";
            tituloSpan.textContent = `${nombreSkin} — Reservado por ${nombreUsuario}`;
            fila.appendChild(tituloSpan);

            const precioSpan = document.createElement("span");
            precioSpan.style.marginLeft = "auto";
            precioSpan.style.color = "#f39c12";
            precioSpan.style.fontWeight = "bold";
            const precio = reserva.precio_reserva ? reserva.precio_reserva : "0.00";
            precioSpan.textContent = `${precio}€`;
            fila.appendChild(precioSpan);

            li.appendChild(fila);

            const subtituloSpan = document.createElement("span");
            subtituloSpan.className = "item-subtitle";
            subtituloSpan.style.display = "flex";
            subtituloSpan.style.alignItems = "center";
            subtituloSpan.style.justifyContent = "space-between";
            subtituloSpan.style.width = "100%";

            const infoIzquierda = document.createElement("span");
            const fechaReserva = reserva.fecha_reserva
                ? new Date(reserva.fecha_reserva).toLocaleString()
                : "Fecha desconocida";
            infoIzquierda.textContent = `ID #${reserva.id} • ${fechaReserva}`;
            subtituloSpan.appendChild(infoIzquierda);

            const etiquetaEstado = document.createElement("span");
            etiquetaEstado.className = `badge-estado badge-${reserva.estado}`;
            const textoEstado =
                reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1);
            etiquetaEstado.textContent = textoEstado;
            subtituloSpan.appendChild(etiquetaEstado);

            li.appendChild(subtituloSpan);

            contenedor.appendChild(li);
        });
    } catch (fallo) {
        contadorReservas.textContent = "Error";
        vaciarContenedor(contenedor);
        contenedor.appendChild(crearItemError(fallo.message));
    }
}

let todasLasSkins = [];
let paginaActual = 1;
const SKINS_POR_PAGINA = 20;

async function fetchSkins() {
    const contenedor = document.getElementById("skins-container");
    const contadorSkins = document.getElementById("stat-skins");
    try {
        const peticion = await fetch("/api/skin-crud/");
        if (!peticion.ok) throw new Error("Error al cargar skins");
        const skins = await peticion.json();

        todasLasSkins = skins.results || skins;
        contadorSkins.textContent = todasLasSkins.length;

        vaciarContenedor(contenedor);

        if (!todasLasSkins || todasLasSkins.length === 0) {
            contenedor.appendChild(crearItemVacio("No hay skins registradas."));
            return;
        }

        const btnAnterior = document.getElementById("skins-prev");
        const btnSiguiente = document.getElementById("skins-next");

        const nuevoAnterior = btnAnterior.cloneNode(true);
        const nuevoSiguiente = btnSiguiente.cloneNode(true);
        btnAnterior.parentNode.replaceChild(nuevoAnterior, btnAnterior);
        btnSiguiente.parentNode.replaceChild(nuevoSiguiente, btnSiguiente);

        nuevoAnterior.addEventListener("click", () => {
            if (paginaActual > 1) {
                paginaActual--;
                pintarPaginaSkins();
            }
        });

        nuevoSiguiente.addEventListener("click", () => {
            if (paginaActual < Math.ceil(todasLasSkins.length / SKINS_POR_PAGINA)) {
                paginaActual++;
                pintarPaginaSkins();
            }
        });

        pintarPaginaSkins();
    } catch (fallo) {
        contadorSkins.textContent = "Error";
        vaciarContenedor(contenedor);
        contenedor.appendChild(crearItemError(fallo.message));
    }
}

function pintarPaginaSkins() {
    const contenedor = document.getElementById("skins-container");
    vaciarContenedor(contenedor);

    const inicio = (paginaActual - 1) * SKINS_POR_PAGINA;
    const fin = inicio + SKINS_POR_PAGINA;
    const skinsPagina = todasLasSkins.slice(inicio, fin);

    skinsPagina.forEach((skin) => {
        const li = document.createElement("li");
        li.className = "data-item";

        const fila = document.createElement("div");
        fila.className = "flex-row";

        const tituloSpan = document.createElement("span");
        tituloSpan.className = "item-title";
        if (skin.stattrack) {
            const stattrak = document.createElement("span");
            stattrak.textContent = "ST™ ";
            stattrak.style.color = "#f97316";
            stattrak.style.fontSize = "0.8rem";
            tituloSpan.appendChild(stattrak);
        }
        tituloSpan.appendChild(document.createTextNode(skin.nombre));
        fila.appendChild(tituloSpan);

        const precioSpan = document.createElement("span");
        precioSpan.style.marginLeft = "auto";
        precioSpan.style.color = "#f39c12";
        precioSpan.style.fontWeight = "bold";
        precioSpan.textContent = `${skin.precio}€`;
        fila.appendChild(precioSpan);

        li.appendChild(fila);

        const subtituloSpan = document.createElement("span");
        subtituloSpan.className = "item-subtitle";
        subtituloSpan.style.display = "flex";
        subtituloSpan.style.gap = "15px";

        const stockSpan = document.createElement("span");
        stockSpan.style.color = skin.stock > 0 ? "#10b981" : "#ef4444";
        stockSpan.innerHTML = `<i class="fa-solid ${skin.stock > 0 ? "fa-check" : "fa-xmark"}"></i> Stock: ${skin.stock}`;
        subtituloSpan.appendChild(stockSpan);

        if (skin.categoria) {
            const catSpan = document.createElement("span");
            catSpan.textContent = skin.categoria;
            catSpan.style.textTransform = "capitalize";
            subtituloSpan.appendChild(catSpan);
        }

        const desgasteSpan = document.createElement("span");
        desgasteSpan.textContent = skin.desgaste ? `Float: ${skin.desgaste}` : "N/A";
        subtituloSpan.appendChild(desgasteSpan);

        const rarezaSpan = document.createElement("span");
        if (skin.rareza) {
            rarezaSpan.textContent = skin.rareza;
            rarezaSpan.className = "badge";
        }
        subtituloSpan.appendChild(rarezaSpan);

        li.appendChild(subtituloSpan);
        contenedor.appendChild(li);
    });

    const totalPaginas = Math.ceil(todasLasSkins.length / SKINS_POR_PAGINA);
    const contenedorPaginacion = document.getElementById("skins-pagination");
    const btnAnterior = document.getElementById("skins-prev");
    const btnSiguiente = document.getElementById("skins-next");
    const infoSpan = document.getElementById("skins-page-info");

    if (totalPaginas > 1) {
        contenedorPaginacion.style.display = "flex";
        infoSpan.textContent = `Página ${paginaActual} de ${totalPaginas}`;

        btnAnterior.disabled = paginaActual === 1;
        btnAnterior.style.opacity = paginaActual === 1 ? "0.4" : "1";
        btnAnterior.style.cursor = paginaActual === 1 ? "not-allowed" : "pointer";

        btnSiguiente.disabled = paginaActual === totalPaginas;
        btnSiguiente.style.opacity = paginaActual === totalPaginas ? "0.4" : "1";
        btnSiguiente.style.cursor = paginaActual === totalPaginas ? "not-allowed" : "pointer";
    } else {
        contenedorPaginacion.style.display = "none";
    }
}
