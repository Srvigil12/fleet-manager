const API_URL = 'http://localhost:3000/api';

async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers }
  };

  const response = await fetch(`${API_URL}${endpoint}`, finalOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en la petición al servidor');
  }

  return response.json();
}

export const api = {
  // --- AUTH ---
  login: (credenciales) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credenciales) }),
  register: (datos) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(datos) }),

  // --- VEHÍCULOS ---
  getVehiculos: () => fetchAPI('/vehiculos'),
  getVehiculo: (id) => fetchAPI(`/vehiculos/${id}`),
  crearVehiculo: (datos) => fetchAPI('/vehiculos', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarVehiculo: (id, datos) => fetchAPI(`/vehiculos/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminarVehiculo: (id) => fetchAPI(`/vehiculos/${id}`, { method: 'DELETE' }),
  devolverVehiculo: (id, datos) => fetchAPI(`/vehiculos/${id}/devolver`, { method: 'POST', body: JSON.stringify(datos) }),

  // --- USUARIOS ---
  getUsuarios: () => fetchAPI('/usuarios'),
  validarConductor: (id) => fetchAPI(`/usuarios/${id}/validar`, { method: 'PUT' }),
  crearReserva: (datos) => fetchAPI('/reservas', { method: 'POST', body: JSON.stringify(datos) }),
  getReservaUsuario: (usuarioId) => fetchAPI(`/reservas/usuario/${usuarioId}`),

  // --- INCIDENCIAS ---
  getIncidencias: () => fetchAPI('/incidencias'),
  getIncidenciasVehiculo: (vehiculoId) => fetchAPI(`/incidencias/vehiculo/${vehiculoId}`),
  crearIncidencia: (datos) => fetchAPI('/incidencias', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarIncidencia: (id, estado, respuestaAdmin) => fetchAPI(`/incidencias/${id}`, { method: 'PUT', body: JSON.stringify({ estado, respuestaAdmin }) }),

  // --- RESERVAS ---
  getReservas: () => fetchAPI('/reservas')
};