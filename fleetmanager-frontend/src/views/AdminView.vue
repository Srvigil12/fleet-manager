<template>
  <div class="layout-app">
    <nav class="navbar-admin">
      <div class="nav-content">
        <h1 class="nav-brand">
          <i class="fa-solid fa-shield-halved"></i> Panel Admin FleetManager
        </h1>
        <button class="btn-logout" @click="cerrarSesion">Cerrar Sesión</button>
      </div>
    </nav>

    <div class="admin-dashboard">
      <div class="grid-admin-top">
        
        <section class="dashboard-panel">
          <div class="panel-header">
            <h3><i class="fa-solid fa-id-card-clip"></i> Validación de Conductores</h3>
          </div>
          <table class="table-modern">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usuarios" :key="user._id">
                <td>{{ user.nombre }}</td>
                <td>
                  <span :class="['badge', user.validado ? 'success' : 'warning']">
                    {{ user.validado ? 'Validado' : 'Pendiente' }}
                  </span>
                </td>
                <td>
                  <button v-if="!user.validado" @click="validarConductor(user._id)" class="btn-sm">Validar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="dashboard-panel">
          <div class="panel-header">
            <h3><i class="fa-solid fa-triangle-exclamation"></i> Incidencias Recientes</h3>
          </div>
          <div class="incidencias-lista">
            <div v-for="inc in incidencias" :key="inc._id" class="incidencia-card">
              <p><strong>Vehículo ID:</strong> {{ inc.vehiculoId }}</p>
              <p>{{ inc.texto }}</p>
              <div class="incidencia-acciones" v-if="inc.estado === 'pendiente'">
                <button @click="responderIncidencia(inc._id, 'resuelta')" class="btn-res">Resolver</button>
                <button @click="responderIncidencia(inc._id, 'rechazada')" class="btn-rech">Rechazar</button>
              </div>
              <span v-else class="status-text">{{ inc.estado }}</span>
            </div>
          </div>
        </section>
      </div>

      <section class="dashboard-panel mt-20">
        <div class="panel-header">
          <h3><i class="fa-solid fa-car"></i> Gestión de Flota</h3>
        </div>
        
        <div class="form-agregar">
          <input v-model="nuevoVehiculo.modelo" placeholder="Modelo del coche" />
          <input v-model.number="nuevoVehiculo.precioHora" type="number" placeholder="Precio/Hora" />
          <select v-model="nuevoVehiculo.motor">
            <option value="gasolina">Gasolina</option>
            <option value="eléctrico">Eléctrico</option>
            <option value="híbrido">Híbrido</option>
          </select>
          <button @click="agregarVehiculo" class="btn-add">Añadir Vehículo</button>
        </div>

        <table class="table-modern">
          <thead>
            <tr>
              <th>ID</th>
              <th>Modelo</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="car in vehiculos" :key="car.id">
              <td>#{{ car.id }}</td>
              <td>{{ car.modelo }}</td>
              <td>{{ car.precioHora }}€/h</td>
              <td>{{ car.estado }}</td>
              <td>
                <button @click="eliminarVehiculo(car.id)" class="btn-del">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api'; 

const router = useRouter();

// ESTADOS
const usuarios = ref([]);
const vehiculos = ref([]);
const incidencias = ref([]);
const nuevoVehiculo = ref({
  modelo: '',
  precioHora: 0,
  motor: 'gasolina',
  imagen: '',
  latitud: 37.3891,
  longitud: -5.9845
});

const cargarDatos = async () => {
  try {
    const [resUsuarios, resVehiculos, resIncidencias] = await Promise.all([
      api.getUsuarios(),
      api.getVehiculos(),
      api.getIncidencias()
    ]);
    
    usuarios.value = resUsuarios;
    vehiculos.value = resVehiculos;
    incidencias.value = resIncidencias;
  } catch (error) {
    console.error("Error al cargar datos del panel de control:", error);
  }
};

const validarConductor = async (id) => {
  try {
    await api.validarConductor(id);
    alert("Conductor validado correctamente");
    await cargarDatos(); 
  } catch (error) {
    alert("Error al validar: " + error.message);
  }
};

const agregarVehiculo = async () => {
  try {
    await api.crearVehiculo(nuevoVehiculo.value);
    alert("Vehículo añadido con éxito");
    nuevoVehiculo.value = { modelo: '', precioHora: 0, motor: 'gasolina', imagen: '', latitud: 37.3891, longitud: -5.9845 };
    await cargarDatos(); 
  } catch (error) {
    alert("Error al añadir vehículo");
  }
};

const eliminarVehiculo = async (id) => {
  if (!confirm("¿Estás seguro de eliminar este vehículo?")) return;
  try {
    await api.eliminarVehiculo(id);
    await cargarDatos();
  } catch (error) {
    alert("Error al eliminar");
  }
};

const responderIncidencia = async (id, estado) => {
  const respuesta = prompt("Escribe una respuesta para el usuario:");
  if (respuesta === null) return;

  try {
    await api.actualizarIncidencia(id, {
      estado: estado,
      respuestaAdmin: respuesta
    });
    alert("Incidencia actualizada");
    await cargarDatos();
  } catch (error) {
    alert("Error al actualizar incidencia");
  }
};

const cerrarSesion = () => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  router.push('/login');
};

onMounted(() => {
  cargarDatos();
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