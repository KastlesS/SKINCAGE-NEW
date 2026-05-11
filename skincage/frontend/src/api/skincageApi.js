/**
 * Helpers para comunicarse con la API REST de SKINCAGE.
 * Usa SessionAuthentication (cookie) automáticamente para usuarios logueados.
 */

const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) return meta.getAttribute('content');
  // Buscar en cookie
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
};

const apiFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCsrfToken(),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers, credentials: 'same-origin' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { status: res.status, data: err };
  }
  return res.json();
};

export const getSkinDetail = (id) => apiFetch(`/api/skin-public/${id}/`);

export const getProfile = () => apiFetch('/api/users/profile/');

export const getReservas = () => apiFetch('/api/reservas/');

export const crearReserva = (skinId) =>
  apiFetch('/api/reservas/', {
    method: 'POST',
    body: JSON.stringify({ skin_id: skinId }),
  });

export const cancelarReserva = (reservaId) =>
  apiFetch(`/api/reservas/${reservaId}/`, { method: 'DELETE' });

export const registerUser = (data) =>
  apiFetch('/api/users/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
