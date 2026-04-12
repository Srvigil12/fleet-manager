<template>
  <div class="layout-app">
    <nav class="navbar-admin">
      <div class="nav-content">
        <h1 class="nav-brand">⚙️ Admin FleetManager</h1>
        <button class="btn-logout" @click="cerrarSesion">Cerrar Sesión</button>
      </div>
    </nav>

    <div class="admin-dashboard">
      <div class="grid-admin-top">
        
        <section class="dashboard-panel">
          <div class="panel-header">
            <h3>Validación de Conductores</h3>
          </div>
          <div class="table-responsive">
            <table class="table-modern">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Licencia</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in usuarios" :key="user._id">
                  <td class="fw-bold">{{ user.nombre }}</td>
                  <td>{{ user.licencia }}</td>
                  <td>
                    <span :class="user.validado ? 'badge-success' : 'badge-warning'">
                      {{ user.validado ? 'Validado' : 'Pendiente' }}
                    </span>
                  </td>
                  <td>
                    <button v-if="!user.validado" class="btn-xs btn-success" @click="validarConductor(user._id)">
                      Aprobar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="dashboard-panel">
          <div class="panel-header header-flex">
            <h3>Gestión de Flota</h3>
            <button class="btn-sm btn-brand" @click="abrirModalNuevo">+ Nuevo Vehículo</button>
          </div>
          <ul class="lista-flota">
            <li v-for="coche in vehiculos" :key="coche.id" class="flota-item">
              <div class="flota-info">
                <span class="flota-id">#{{ coche.id }}</span>
                <span class="flota-modelo">{{ coche.modelo }}</span>
                <span class="flota-km">{{ coche.km }} km</span>
                <span :class="['badge-sm', coche.estado.replace(' ', '-')]">{{ coche.estado }}</span>
              </div>
              <div class="flota-acciones">
                <button class="btn-xs btn-outline" @click="abrirModalEditar(coche)">Editar</button>
                <button class="btn-xs btn-danger" @click="eliminarVehiculo(coche.id)">Borrar</button>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <section class="dashboard-panel panel-full">
        <div class="panel-header">
          <h3>Historial de Reservas</h3>
        </div>
        <div class="table-responsive">
          <table class="table-modern">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Conductor</th>
                <th>ID Vehículo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reserva in reservas" :key="reserva._id">
                <td>{{ new Date(reserva.fechaReserva).toLocaleString() }}</td>
                <td class="fw-bold">
                  {{ reserva.usuarioId ? `${reserva.usuarioId.nombre} (${reserva.usuarioId.licencia})` : 'Usuario eliminado' }}
                </td>
                <td><span class="tag-id">#{{ reserva.vehiculoId }}</span></td>
                <td>
                  <span :class="reserva.estado === 'activa' ? 'badge-warning' : 'badge-success'">
                    {{ reserva.estado.toUpperCase() }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="dashboard-panel panel-full">
        <div class="panel-header">
          <h3>Centro de Incidencias Taller</h3>
        </div>
        <div class="table-responsive">
          <table class="table-modern">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Reporte del Cliente</th>
                <th>Estado</th>
                <th>Resolución Técnica</th>
                <th>Acciones Taller</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inc in incidencias" :key="inc._id">
                <td><span class="tag-id">#{{ inc.vehiculoId }}</span></td>
                <td class="texto-problema" :title="inc.texto">{{ inc.texto }}</td>
                <td><span :class="['badge-sm', inc.estado]">{{ inc.estado }}</span></td>
                <td>
                  <input 
                    v-if="inc.estado === 'pendiente'" 
                    v-model="respuestasPendientes[inc._id]" 
                    placeholder="Escribe la reparación..." 
                    class="input-taller" 
                  />
                  <span v-else class="texto-resolucion">
                    {{ inc.respuestaAdmin || 'Cerrada sin comentarios' }}
                  </span>
                </td>
                <td class="td-acciones">
                  <div v-if="inc.estado === 'pendiente'" class="flex-gap">
                    <button class="btn-xs btn-success" @click="actualizarIncidencia(inc._id, 'resuelta', respuestasPendientes[inc._id])">
                      ✔ Resolver
                    </button>
                    <button class="btn-xs btn-danger-outline" @click="actualizarIncidencia(inc._id, 'rechazada', 'Falsa alarma')">
                      ✖ Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content modal-largo">
        <div class="modal-header">
          <h3>{{ cocheEditando ? 'Actualizar Ficha Técnica' : 'Alta de Nuevo Vehículo' }}</h3>
          <button type="button" class="btn-cerrar-modal" @click="cerrarModal">✖</button>
        </div>
        
        <form @submit.prevent="guardarVehiculo" class="formulario-modal">
          <div class="form-row">
            <div class="form-group">
              <label>Modelo:</label>
              <input v-model="formVehiculo.modelo" placeholder="Ej: Toyota Corolla" required />
            </div>
            <div class="form-group">
              <label>URL Imagen:</label>
              <input v-model="formVehiculo.imagen" placeholder="https://..." />
            </div>
          </div>

          <div class="vista-previa-contenedor" v-if="formVehiculo.imagen">
            <img :src="formVehiculo.imagen" class="img-previa" @error="imagenError" alt="Vista previa del vehículo" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Precio Tarifa (€/h):</label>
              <input v-model="formVehiculo.precioHora" type="number" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Estado Operativo:</label>
              <select v-model="formVehiculo.estado">
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="en taller">En taller</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Motor:</label>
              <select v-model="formVehiculo.motor">
                <option value="gasolina">Gasolina</option>
                <option value="diésel">Diésel</option>
                <option value="eléctrico">Eléctrico</option>
                <option value="híbrido">Híbrido</option>
              </select>
            </div>
            <div class="form-group">
              <label>Odómetro (km):</label>
              <input v-model="formVehiculo.km" type="number" required />
            </div>
          </div>
          
          <div class="seccion-gris">
            <h4>Punto de Estacionamiento</h4>
            <div class="buscador-direccion">
              <input 
                v-model="direccionBusqueda" 
                type="text" 
                placeholder="Calle, Número, CP, Ciudad..." 
                @keyup.enter.prevent="buscarDireccionAdmin" 
              />
              <button type="button" class="btn-sm btn-outline" @click="buscarDireccionAdmin">
                Buscar Coordenadas
              </button>
            </div>
            <p class="ayuda-texto">💡 Arrastra el marcador o haz clic en el mapa para ajustar la posición.</p>
            <div id="mapa-admin" class="mapa-admin-container"></div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Latitud:</label>
                <input v-model="formVehiculo.latitud" type="number" step="any" readonly class="input-readonly" />
              </div>
              <div class="form-group">
                <label>Longitud:</label>
                <input v-model="formVehiculo.longitud" type="number" step="any" readonly class="input-readonly" />
              </div>
            </div>
          </div>

          <div class="modal-acciones">
            <button type="button" class="btn-ghost-dark" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-brand">
              {{ cocheEditando ? 'Guardar Cambios' : 'Dar de Alta' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const router = useRouter();

// Tu clave de OpenCage
const OPENCAGE_KEY = '9585c88d5e604d57b2bb360359642da6';

// Estados
const usuarios = ref([]);
const vehiculos = ref([]);
const incidencias = ref([]);
const reservas = ref([]);
const respuestasPendientes = ref({});
const mostrarModal = ref(false);
const cocheEditando = ref(null);
const formVehiculo = ref({ 
  modelo: '', 
  imagen: '', 
  precioHora: '', 
  estado: 'disponible', 
  latitud: 37.3891, 
  longitud: -5.9845, 
  km: 0, 
  motor: 'gasolina' 
});

// Mapa y búsqueda
const direccionBusqueda = ref('');
let mapAdmin = null;
let markerAdmin = null;

// --- FUNCIONES DE BASE DE DATOS ---

const cargarUsuarios = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/usuarios', { credentials: 'include' });
    if (res.ok) usuarios.value = await res.json();
  } catch (error) {
    console.error('Error cargando usuarios', error);
  }
};

const validarConductor = async (id) => {
  try {
    await fetch(`http://localhost:3000/api/usuarios/${id}/validar`, { 
      method: 'PUT', 
      credentials: 'include' 
    });
    cargarUsuarios();
  } catch (error) {
    console.error('Error validando conductor', error);
  }
};

const cargarVehiculos = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/vehiculos', { credentials: 'include' });
    if (res.ok) vehiculos.value = await res.json();
  } catch (error) {
    console.error('Error cargando vehículos', error);
  }
};

const eliminarVehiculo = async (id) => {
  if (!confirm('¿Seguro que deseas eliminar este vehículo de la flota?')) return;
  try {
    await fetch(`http://localhost:3000/api/vehiculos/${id}`, { 
      method: 'DELETE', 
      credentials: 'include' 
    });
    cargarVehiculos();
  } catch (error) {
    console.error('Error eliminando vehículo', error);
  }
};

const cargarIncidencias = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/incidencias', { credentials: 'include' });
    if (res.ok) incidencias.value = await res.json();
  } catch (error) {
    console.error('Error cargando incidencias', error);
  }
};

const actualizarIncidencia = async (id, nuevoEstado, respuesta = '') => {
  try {
    const res = await fetch(`http://localhost:3000/api/incidencias/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      credentials: 'include', 
      body: JSON.stringify({ estado: nuevoEstado, respuestaAdmin: respuesta }) 
    });
    if (res.ok) cargarIncidencias();
  } catch (error) {
    console.error("Error al actualizar incidencia:", error);
  }
};

const cargarReservas = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/reservas', { credentials: 'include' });
    if (res.ok) reservas.value = await res.json();
  } catch (error) {
    console.error('Error cargando reservas', error);
  }
};

// --- FUNCIONES DEL MAPA Y MODAL ---

const inicializarMapaModal = () => {
  const lat = formVehiculo.value.latitud || 37.3891;
  const lng = formVehiculo.value.longitud || -5.9845;

  if (mapAdmin) {
    mapAdmin.remove();
    mapAdmin = null;
  }

  mapAdmin = L.map('mapa-admin').setView([lat, lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapAdmin);

  const iconoRojo = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  markerAdmin = L.marker([lat, lng], { icon: iconoRojo, draggable: true }).addTo(mapAdmin);

  // Al arrastrar el marcador
  markerAdmin.on('dragend', () => {
    const p = markerAdmin.getLatLng();
    formVehiculo.value.latitud = parseFloat(p.lat.toFixed(6));
    formVehiculo.value.longitud = parseFloat(p.lng.toFixed(6));
  });

  // Al hacer clic en el mapa
  mapAdmin.on('click', (e) => {
    markerAdmin.setLatLng(e.latlng);
    formVehiculo.value.latitud = parseFloat(e.latlng.lat.toFixed(6));
    formVehiculo.value.longitud = parseFloat(e.latlng.lng.toFixed(6));
  });
};

const buscarDireccionAdmin = async () => {
  if (!direccionBusqueda.value) return;
  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(direccionBusqueda.value)}&key=${OPENCAGE_KEY}&language=es`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      formVehiculo.value.latitud = lat;
      formVehiculo.value.longitud = lng;
      
      if (mapAdmin && markerAdmin) {
        mapAdmin.setView([lat, lng], 16);
        markerAdmin.setLatLng([lat, lng]);
      }
    } else {
      alert("Dirección no encontrada.");
    }
  } catch (error) {
    console.error('Error buscando dirección:', error);
  }
};

const imagenError = (e) => {
  e.target.src = 'https://via.placeholder.com/600x200?text=Error+de+Imagen';
};

const abrirModalNuevo = () => {
  cocheEditando.value = null;
  formVehiculo.value = { 
    modelo: '', 
    imagen: '', 
    precioHora: '', 
    estado: 'disponible', 
    latitud: 37.3891, 
    longitud: -5.9845, 
    km: 0, 
    motor: 'gasolina' 
  };
  direccionBusqueda.value = '';
  mostrarModal.value = true;
  nextTick(() => inicializarMapaModal());
};

const abrirModalEditar = (coche) => {
  cocheEditando.value = coche;
  formVehiculo.value = { ...coche };
  direccionBusqueda.value = '';
  mostrarModal.value = true;
  nextTick(() => inicializarMapaModal());
};

const cerrarModal = () => {
  mostrarModal.value = false;
  if (mapAdmin) {
    mapAdmin.remove();
    mapAdmin = null;
  }
};

const guardarVehiculo = async () => {
  const url = cocheEditando.value ? `http://localhost:3000/api/vehiculos/${cocheEditando.value.id}` : 'http://localhost:3000/api/vehiculos';
  const method = cocheEditando.value ? 'PUT' : 'POST';
  
  try {
    await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      credentials: 'include', 
      body: JSON.stringify(formVehiculo.value) 
    });
    cerrarModal();
    cargarVehiculos();
  } catch (error) {
    console.error('Error guardando vehículo:', error);
  }
};

const cerrarSesion = () => {
  localStorage.removeItem('usuarioId');
  localStorage.removeItem('usuarioRol');
  router.push('/');
};

// --- INICIO ---
onMounted(() => {
  cargarUsuarios();
  cargarVehiculos();
  cargarIncidencias();
  cargarReservas();
});
</script>

<style scoped>
/* NAVBAR OSCURO ADMIN */
.navbar-admin { background: #0F172A; color: white; padding: 15px 0; box-shadow: var(--shadow-md); position: sticky; top: 0; z-index: 100; }
.nav-content { max-width: 1400px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
.nav-brand { margin: 0; font-size: 1.3rem; font-weight: 700; color: #E2E8F0; }
.btn-logout { background: transparent; color: #94A3B8; border: 1px solid #334155; padding: 6px 14px; border-radius: var(--radius-md); font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
.btn-logout:hover { background: #1E293B; color: white; }

/* DASHBOARD LAYOUT */
.admin-dashboard { max-width: 1400px; margin: 30px auto; padding: 0 20px; display: flex; flex-direction: column; gap: 25px; }
.grid-admin-top { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
@media (max-width: 1024px) { .grid-admin-top { grid-template-columns: 1fr; } }

.dashboard-panel { background: var(--card-bg); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid #E2E8F0; overflow: hidden; }
.panel-header { background: #F8FAFC; padding: 15px 20px; border-bottom: 1px solid #E2E8F0; }
.panel-header h3 { margin: 0; font-size: 1.1rem; color: #334155; font-weight: 700; }
.header-flex { display: flex; justify-content: space-between; align-items: center; }

/* TABLAS MODERNAS */
.table-responsive { overflow-x: auto; }
.table-modern { width: 100%; border-collapse: collapse; text-align: left; }
.table-modern th { background: #F1F5F9; color: #475569; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 20px; border-bottom: 2px solid #E2E8F0; }
.table-modern td { padding: 15px 20px; border-bottom: 1px solid #E2E8F0; color: var(--text-main); font-size: 0.95rem; vertical-align: middle;}
.table-modern tr:last-child td { border-bottom: none; }
.table-modern tr:hover td { background-color: #F8FAFC; }
.fw-bold { font-weight: 600; }

/* LISTA FLOTA (ESTILO LISTA) */
.lista-flota { list-style: none; padding: 0; margin: 0; }
.flota-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #E2E8F0; }
.flota-item:last-child { border-bottom: none; }
.flota-info { display: flex; align-items: center; gap: 15px; }
.flota-id { color: var(--text-muted); font-family: monospace; font-size: 0.9rem;}
.flota-modelo { font-weight: 600; color: var(--text-main); }
.flota-km { color: var(--text-muted); font-size: 0.9rem; }
.flota-acciones { display: flex; gap: 8px; }

/* INPUTS DENTRO DE TABLAS */
.input-taller { width: 100%; padding: 8px 10px; border: 1px dashed #CBD5E1; border-radius: 4px; font-size: 0.9rem; }
.input-taller:focus { border-style: solid; border-color: var(--brand-primary); outline: none; }
.texto-problema { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.texto-resolucion { font-style: italic; color: #475569; }
.flex-gap { display: flex; gap: 8px; }

/* BADGES */
.badge-success { background: var(--success-bg); color: #065F46; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
.badge-warning { background: var(--warning-bg); color: #92400E; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
.badge-sm { padding: 4px 8px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.disponible { background: var(--success-bg); color: #065F46; }
.reservado, .pendiente { background: var(--warning-bg); color: #92400E; }
.en-taller, .rechazada { background: var(--danger-bg); color: #991B1B; }
.resuelta { background: var(--success-bg); color: #065F46; }
.tag-id { background: #E2E8F0; color: #334155; padding: 3px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85rem;}

/* BOTONES ADMIN */
.btn-brand { background: var(--brand-primary); color: white; border: none; padding: 8px 16px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
.btn-brand:hover { background: var(--brand-hover); }
.btn-sm { padding: 6px 12px; font-size: 0.9rem; }
.btn-xs { padding: 5px 10px; font-size: 0.8rem; border-radius: 4px; border: none; font-weight: 600; cursor: pointer; }
.btn-success { background: var(--success); color: white; }
.btn-danger { background: var(--danger); color: white; }
.btn-danger-outline { background: transparent; color: var(--danger); border: 1px solid var(--danger); }
.btn-outline { background: transparent; border: 1px solid #CBD5E1; color: #475569; }
.btn-outline:hover { background: #F1F5F9; }

/* MODAL Y FORMULARIOS */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px);}
.modal-content { background: white; border-radius: var(--radius-lg); width: 100%; max-width: 650px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.modal-header { padding: 20px 25px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; color: #0F172A; font-size: 1.25rem; }
.btn-cerrar-modal { background: none; border: none; font-size: 1.2rem; color: #94A3B8; cursor: pointer; }
.formulario-modal { padding: 25px; overflow-y: auto; }

.form-group { margin-bottom: 15px; display: flex; flex-direction: column;}
.form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
.form-group input, .form-group select { padding: 10px 12px; border: 1px solid #CBD5E1; border-radius: var(--radius-md); font-size: 0.95rem; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 3px var(--brand-light); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

.vista-previa-contenedor { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; background: #F8FAFC; padding: 10px; border-radius: var(--radius-md); border: 1px dashed #CBD5E1; }
.img-previa { height: 120px; object-fit: contain; }

.seccion-gris { background: #F8FAFC; padding: 20px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; margin-top: 10px; }
.seccion-gris h4 { margin: 0 0 15px 0; font-size: 1rem; color: #334155; }
.buscador-direccion { display: flex; gap: 10px; margin-bottom: 15px; }
.buscador-direccion input { flex: 1; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 4px; }
.ayuda-texto { font-size: 0.85rem; color: #64748B; font-style: italic; margin-top: 0; margin-bottom: 10px;}
.mapa-admin-container { height: 200px; width: 100%; border-radius: 8px; border: 1px solid #CBD5E1; z-index: 1; margin-bottom: 15px;}
.input-readonly { background-color: #F1F5F9; color: #64748B; cursor: not-allowed; }

.modal-acciones { display: flex; justify-content: flex-end; gap: 12px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #E2E8F0; }
.btn-ghost-dark { background: transparent; color: #475569; border: none; font-weight: 600; cursor: pointer; padding: 8px 16px; }
</style>