document.addEventListener('DOMContentLoaded', () => {
    // Inicializar pestañas
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar clase active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Añadir clase active al pulsado y su contenido
            btn.classList.add('active');
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) target.classList.add('active');
        });
    });

    // Cargar datos
    fetchUsers();
    fetchReservas();
    fetchSkins();
});

function emptyContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function createErrorItem(message) {
    const li = document.createElement('li');
    li.className = 'data-item';
    li.style.color = '#e74c3c';
    li.textContent = `Error: ${message}`;
    return li;
}

function createEmptyMessageItem(message) {
    const li = document.createElement('li');
    li.className = 'data-item';
    const span = document.createElement('span');
    span.style.color = '#8b8b9e';
    span.textContent = message;
    li.appendChild(span);
    return li;
}

async function fetchUsers() {
    const container = document.getElementById('users-container');
    const statUsers = document.getElementById('stat-users');
    try {
        const response = await fetch('/api/users/all/');
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const users = await response.json();
        
        statUsers.textContent = users.length;
        emptyContainer(container);
        
        if (users.length === 0) {
            container.appendChild(createEmptyMessageItem('No hay usuarios registrados.'));
            return;
        }
        
        users.forEach(user => {
            const li = document.createElement('li');
            li.className = 'data-item';
            
            const flexRow = document.createElement('div');
            flexRow.className = 'flex-row';
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'item-title';
            titleSpan.textContent = user.username;
            flexRow.appendChild(titleSpan);
            
            const roleBadge = document.createElement('span');
            roleBadge.className = user.is_staff ? 'badge admin' : 'badge';
            roleBadge.textContent = user.is_staff ? 'Admin' : 'Usuario';
            flexRow.appendChild(roleBadge);
            
            li.appendChild(flexRow);
            
            const subtitleSpan = document.createElement('span');
            subtitleSpan.className = 'item-subtitle';
            const date = new Date(user.date_joined).toLocaleDateString();
            const email = user.email ? user.email : 'Sin correo electrónico';
            
            // Añadir balance si viene en la API (el modelo original no lo tiene por defecto en admin endpoint, pero lo preparamos por si acaso)
            const balanceStr = user.balance !== undefined ? ` • Balance: ${user.balance}€` : '';
            
            subtitleSpan.textContent = `${email} • Registrado: ${date}${balanceStr}`;
            li.appendChild(subtitleSpan);
            
            container.appendChild(li);
        });
    } catch (error) {
        statUsers.textContent = "Error";
        emptyContainer(container);
        container.appendChild(createErrorItem(error.message));
    }
}

async function fetchReservas() {
    const container = document.getElementById('reservas-container');
    const statReservas = document.getElementById('stat-reservas');
    try {
        const response = await fetch('/api/reservas/');
        if (!response.ok) throw new Error('Error al cargar reservas');
        const reservas = await response.json();
        
        const data = reservas.results || reservas;
        // Contar reservas activas (confirmadas)
        const activas = data.filter(r => r.estado === 'confirmada').length;
        statReservas.textContent = activas;
        
        emptyContainer(container);

        if (!data || data.length === 0) {
            container.appendChild(createEmptyMessageItem('No hay reservas en el sistema.'));
            return;
        }
        
        data.forEach(res => {
            const li = document.createElement('li');
            li.className = 'data-item';
            
            const flexRow = document.createElement('div');
            flexRow.className = 'flex-row';
            
            const skinName = res.skin ? (res.skin.nombre || `Skin ID: ${res.skin}`) : 'Skin Desconocida';
            const titleSpan = document.createElement('span');
            titleSpan.className = 'item-title';
            const userStr = res.usuario ? (res.usuario.username || `Usuario #${res.usuario}`) : 'Desconocido';
            titleSpan.textContent = `${skinName} — Reservado por ${userStr}`;
            flexRow.appendChild(titleSpan);
            
            const priceSpan = document.createElement('span');
            priceSpan.style.marginLeft = 'auto';
            priceSpan.style.color = '#f39c12';
            priceSpan.style.fontWeight = 'bold';
            const price = res.precio_reserva ? res.precio_reserva : '0.00';
            priceSpan.textContent = `${price}€`;
            flexRow.appendChild(priceSpan);
            
            li.appendChild(flexRow);
            
            const subtitleSpan = document.createElement('span');
            subtitleSpan.className = 'item-subtitle';
            subtitleSpan.style.display = 'flex';
            subtitleSpan.style.alignItems = 'center';
            subtitleSpan.style.justifyContent = 'space-between';
            subtitleSpan.style.width = '100%';
            
            const infoLeft = document.createElement('span');
            const date = res.fecha_reserva ? new Date(res.fecha_reserva).toLocaleString() : 'Fecha desconocida';
            infoLeft.textContent = `ID #${res.id} • ${date}`;
            subtitleSpan.appendChild(infoLeft);
            
            const badgeSpan = document.createElement('span');
            badgeSpan.className = `badge-estado badge-${res.estado}`;
            // Formatear texto del badge (capitalizado)
            const estadoTexto = res.estado.charAt(0).toUpperCase() + res.estado.slice(1);
            badgeSpan.textContent = estadoTexto;
            subtitleSpan.appendChild(badgeSpan);
            
            li.appendChild(subtitleSpan);
            
            container.appendChild(li);
        });
    } catch (error) {
        statReservas.textContent = "Error";
        emptyContainer(container);
        container.appendChild(createErrorItem(error.message));
    }
}

async function fetchSkins() {
    const container = document.getElementById('skins-container');
    const statSkins = document.getElementById('stat-skins');
    try {
        const response = await fetch('/api/skin-crud/');
        if (!response.ok) throw new Error('Error al cargar skins');
        const skins = await response.json();
        
        const data = skins.results || skins;
        statSkins.textContent = data.length;
        
        emptyContainer(container);

        if (!data || data.length === 0) {
            container.appendChild(createEmptyMessageItem('No hay skins registradas.'));
            return;
        }
        
        data.forEach(skin => {
            const li = document.createElement('li');
            li.className = 'data-item';
            
            const flexRow = document.createElement('div');
            flexRow.className = 'flex-row';
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'item-title';
            // Añadir Stattrak visualmente
            if (skin.stattrack) {
                const st = document.createElement('span');
                st.textContent = 'ST™ ';
                st.style.color = '#f97316';
                st.style.fontSize = '0.8rem';
                titleSpan.appendChild(st);
            }
            titleSpan.appendChild(document.createTextNode(skin.nombre));
            flexRow.appendChild(titleSpan);
            
            const priceSpan = document.createElement('span');
            priceSpan.style.marginLeft = 'auto';
            priceSpan.style.color = '#f39c12';
            priceSpan.style.fontWeight = 'bold';
            priceSpan.textContent = `${skin.precio}€`;
            flexRow.appendChild(priceSpan);
            
            li.appendChild(flexRow);
            
            const subtitleSpan = document.createElement('span');
            subtitleSpan.className = 'item-subtitle';
            subtitleSpan.style.display = 'flex';
            subtitleSpan.style.gap = '15px';
            
            const stockSpan = document.createElement('span');
            stockSpan.style.color = skin.stock > 0 ? '#10b981' : '#ef4444';
            stockSpan.innerHTML = `<i class="fa-solid ${skin.stock > 0 ? 'fa-check' : 'fa-xmark'}"></i> Stock: ${skin.stock}`;
            subtitleSpan.appendChild(stockSpan);
            
            if (skin.categoria) {
                const catSpan = document.createElement('span');
                catSpan.textContent = skin.categoria;
                catSpan.style.textTransform = 'capitalize';
                subtitleSpan.appendChild(catSpan);
            }
            
            const wearSpan = document.createElement('span');
            wearSpan.textContent = skin.desgaste ? `Float: ${skin.desgaste}` : 'N/A';
            subtitleSpan.appendChild(wearSpan);
            
            const raritySpan = document.createElement('span');
            if (skin.rareza) {
                raritySpan.textContent = skin.rareza;
                raritySpan.className = 'badge'; // Usar badge simple para rareza
            }
            subtitleSpan.appendChild(raritySpan);
            
            li.appendChild(subtitleSpan);
            
            container.appendChild(li);
        });
    } catch (error) {
        statSkins.textContent = "Error";
        emptyContainer(container);
        container.appendChild(createErrorItem(error.message));
    }
}
