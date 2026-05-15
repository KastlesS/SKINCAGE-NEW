document.addEventListener('DOMContentLoaded', () => {
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
    try {
        const response = await fetch('/api/users/all/');
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const users = await response.json();
        
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
            subtitleSpan.textContent = `${email} • Registrado: ${date}`;
            li.appendChild(subtitleSpan);
            
            container.appendChild(li);
        });
    } catch (error) {
        emptyContainer(container);
        container.appendChild(createErrorItem(error.message));
    }
}

async function fetchReservas() {
    const container = document.getElementById('reservas-container');
    try {
        const response = await fetch('/api/reservas/');
        if (!response.ok) throw new Error('Error al cargar reservas');
        const reservas = await response.json();
        
        emptyContainer(container);
        
        const data = reservas.results || reservas;

        if (!data || data.length === 0) {
            container.appendChild(createEmptyMessageItem('No hay reservas actualmente.'));
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
            titleSpan.textContent = skinName;
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
            const date = res.fecha_reserva ? new Date(res.fecha_reserva).toLocaleString() : 'Fecha desconocida';
            const userStr = res.usuario ? `Reservado por ID ${res.usuario}` : '';
            subtitleSpan.textContent = `Reserva #${res.id} • ${date} ${userStr ? '• ' + userStr : ''}`;
            li.appendChild(subtitleSpan);
            
            container.appendChild(li);
        });
    } catch (error) {
        emptyContainer(container);
        container.appendChild(createErrorItem(error.message));
    }
}

async function fetchSkins() {
    const container = document.getElementById('skins-container');
    try {
        const response = await fetch('/api/skin-crud/');
        if (!response.ok) throw new Error('Error al cargar skins');
        const skins = await response.json();
        
        emptyContainer(container);
        
        const data = skins.results || skins;

        if (!data || data.length === 0) {
            container.appendChild(createEmptyMessageItem('No hay skins en el mercado.'));
            return;
        }
        
        data.forEach(skin => {
            const li = document.createElement('li');
            li.className = 'data-item';
            
            const flexRow = document.createElement('div');
            flexRow.className = 'flex-row';
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'item-title';
            titleSpan.textContent = skin.nombre;
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
            subtitleSpan.style.gap = '10px';
            
            const stockSpan = document.createElement('span');
            stockSpan.style.color = skin.stock > 0 ? '#2ecc71' : '#e74c3c';
            stockSpan.textContent = `${skin.stock} en stock`;
            subtitleSpan.appendChild(stockSpan);
            
            const wearSpan = document.createElement('span');
            wearSpan.textContent = skin.desgaste ? `Float: ${skin.desgaste}` : 'N/A';
            subtitleSpan.appendChild(wearSpan);
            
            const raritySpan = document.createElement('span');
            if (skin.get_rareza_display) {
                raritySpan.textContent = skin.get_rareza_display;
            }
            subtitleSpan.appendChild(raritySpan);
            
            li.appendChild(subtitleSpan);
            
            container.appendChild(li);
        });
    } catch (error) {
        emptyContainer(container);
        container.appendChild(createErrorItem(error.message));
    }
}
