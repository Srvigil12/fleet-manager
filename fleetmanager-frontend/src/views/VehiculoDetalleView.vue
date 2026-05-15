<template>
  <div class="layout-app">
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="nav-brand">FleetManager</h1>
      </div>
    </nav>

    <div class="detalle-container" v-if="vehiculo">
      <header class="cabecera-detalle">
        <button class="btn-ghost" @click="router.push('/usuario')">
          <i class="fa-solid fa-arrow-left" style="margin-right: 8px;"></i> Volver al Catálogo
        </button>
      </header>

      <div class="contenido-principal">
        
        <section class="panel-coche card-style">
          <img :src="vehiculo.imagen || 'https://via.placeholder.com/600x400?text=Coche'" alt="Foto coche" class="img-detalle" />
          <h2 class="titulo-coche">
            <i class="fa-solid fa-car-side" style="color: var(--brand-primary); margin-right: 8px;"></i> {{ vehiculo.modelo }}
          </h2>
          
          <div class="grid-info">
            <div class="info-item">
              <span class="icono"><i class="fa-solid fa-car-battery" style="color: #64748b;"></i></span>
              <div>
                <strong>Motor</strong>
                <p class="valor-info">{{ vehiculo.motor }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icono"><i class="fa-solid fa-road" style="color: #64748b;"></i></span>
              <div>
                <strong>Kms Totales</strong>
                <p class="valor-info">{{ vehiculo.km }} km</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icono"><i class="fa-solid fa-euro-sign" style="color: #64748b;"></i></span>
              <div>
                <strong>Tarifa</strong>
                <p class="valor-info">{{ vehiculo.precioHora }} €/h</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icono"><i class="fa-solid fa-traffic-light" style="color: #64748b;"></i></span>
              <div>
                <strong>Estado</strong>
                <p><span :class="['badge-estado', vehiculo.estado.replace(' ', '-')]">{{ vehiculo.estado }}</span></p>
              </div>
            </div>
          </div>

          <div class="seccion-ubicacion">
            <h3 class="seccion-titulo" v-if="vehiculo.estado === 'reservado'">
              <i class="fa-solid fa-location-dot" style="color: #ef4444; margin-right: 8px;"></i> Destino de aparcamiento
            </h3>
            <h3 class="seccion-titulo" v-else>
              <i class="fa-solid fa-location-dot" style="color: #ef4444; margin-right: 8px;"></i> Ubicación Actual
            </h3>
            
            <div v-if="vehiculo.estado === 'reservado'" class="buscador-direccion">
              <input 
                v-model="direccionDevolucion" 
                type="text" 
                placeholder="Calle, ciudad o arrastra el mapa..." 
                @keyup.enter.prevent="buscarDireccionDevolucion" 
              />
              <button class="btn-brand" @click="buscarDireccionDevolucion">
                <i class="fa-solid fa-magnifying-glass" style="margin-right: 5px;"></i> Buscar
              </button>
            </div>
            <p v-else class="direccion-texto">{{ direccionReal || 'Cargando ubicación exacta...' }}</p>

            <div id="mapa-detalle" class="mapa-pequeno"></div>
          </div>
        </section>

        <section class="columna-derecha">
          
          <div v-if="vehiculo.estado === 'reservado'" class="card-style bloque-devolucion">
            <h3 class="titulo-destacado"><i class="fa-solid fa-flag-checkered" style="margin-right: 8px;"></i> Finalizar Viaje</h3>
            <p class="desc-devolucion">Mueve el marcador rojo del mapa hasta el lugar exacto donde has estacionado el coche.</p>
            
            <label class="label-incidencia">¿Algún daño o incidencia reportable? (Opcional)</label>
            <textarea 
              v-model="incidenciaDevolucion" 
              class="textarea-moderno" 
              placeholder="Ej: He encontrado un arañazo en la puerta derecha..."
            ></textarea>
            
            <button class="btn-success btn-full" @click="devolverVehiculo">
              <i class="fa-solid fa-check" style="margin-right: 8px;"></i> Confirmar Devolución del Vehículo
            </button>
          </div>

          <div class="card-style panel-incidencias">
            <div v-if="vehiculo.estado !== 'reservado'">
              <h3 class="seccion-titulo"><i class="fa-solid fa-triangle-exclamation" style="color: var(--brand-primary); margin-right: 8px;"></i> Reportar Avería</h3>
              <textarea 
                v-model="nuevaIncidencia" 
                class="textarea-moderno" 
                placeholder="Describe el problema detectado antes o durante tu revisión del coche..."
              ></textarea>
              <button class="btn-brand btn-full" @click="enviarIncidencia" :disabled="!nuevaIncidencia">
                <i class="fa-solid fa-paper-plane" style="margin-right: 8px;"></i> Enviar Reporte Oficial
              </button>
              <hr class="divisor" />
            </div>

            <h3 class="seccion-titulo"><i class="fa-solid fa-clipboard-list" style="margin-right: 8px;"></i> Historial Técnico</h3>
            <ul class="lista-incidencias" v-if="incidencias.length > 0">
              <li v-for="inc in incidencias" :key="inc._id" class="tarjeta-incidencia">
                <div class="cabecera-inc">
                  <strong>{{ inc.usuarioId ? inc.usuarioId.nombre : 'Usuario' }}</strong>
                  <span class="fecha">{{ new Date(inc.fecha).toLocaleDateString() }}</span>
                </div>
                <p class="problema">{{ inc.texto }}</p>
                <div class="resolucion">
                  <span :class="['badge-inc', inc.estado]">{{ inc.estado.toUpperCase() }}</span>
                  <p v-if="inc.respuestaAdmin" class="respuesta-admin">↳ {{ inc.respuestaAdmin }}</p>
                </div>
              </li>
            </ul>
            <div v-else class="sin-incidencias">
              <span class="icono-ok"><i class="fa-solid fa-shield-halved"></i></span>
              <p>Vehículo en perfecto estado. Sin incidencias previas registradas.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
    
    <div v-else class="cargando">
      <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Cargando ficha técnica del vehículo...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute(); 
const router = useRouter();
const vehiculoId = route.params.id;

// --- ESTADOS ---
const vehiculo = ref(null); 
const incidencias = ref([]); 
const nuevaIncidencia = ref(''); 
const direccionReal = ref('');

// Variables Devolución
const direccionDevolucion = ref(''); 
const incidenciaDevolucion = ref(''); 
const latDevolucion = ref(null); 
const lngDevolucion = ref(null);

// Mapa
let mapDetalle = null; 
let markerDetalle = null;

// --- CLAVE REAL OPENCAGE ---
const OPENCAGE_KEY = '9585c88d5e604d57b2bb360359642da6'; 

// --- FUNCIONES ---
const cargarDetalles = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/vehiculos/${vehiculoId}`, { credentials: 'include' });
    if (res.ok) {
      vehiculo.value = await res.json();
      
      // Precargar datos para la devolución
      latDevolucion.value = vehiculo.value.latitud; 
      lngDevolucion.value = vehiculo.value.longitud;
      
      if (vehiculo.value.latitud && vehiculo.value.longitud) {
        traducirCoordenadas(vehiculo.value.latitud, vehiculo.value.longitud);
        nextTick(() => { 
          inicializarMapaPequeno(vehiculo.value.latitud, vehiculo.value.longitud); 
        });
      }
    }
  } catch (error) {
    console.error("Error al cargar detalles:", error);
  }
};

const traducirCoordenadas = async (lat, lng) => {
  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_KEY}&language=es`);
    const data = await res.json();
    if (data.results && data.results.length > 0) { 
      direccionReal.value = data.results[0].formatted; 
      direccionDevolucion.value = data.results[0].formatted; 
    } else { 
      direccionReal.value = 'Dirección no disponible'; 
    }
  } catch (error) {
    console.error("Error al traducir:", error);
  }
};

const buscarDireccionDevolucion = async () => {
  if (!direccionDevolucion.value) return;
  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(direccionDevolucion.value)}&key=${OPENCAGE_KEY}&language=es`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      latDevolucion.value = lat; 
      lngDevolucion.value = lng;
      
      if (mapDetalle && markerDetalle) { 
        mapDetalle.setView([lat, lng], 16); 
        markerDetalle.setLatLng([lat, lng]); 
      }
    }
  } catch (error) {
    console.error("Error geocodificando destino:", error);
  }
};

const inicializarMapaPequeno = (lat, lng) => {
  if (mapDetalle) { 
    mapDetalle.remove(); 
    mapDetalle = null; 
  } 
  
  mapDetalle = L.map('mapa-detalle').setView([lat, lng], 16); 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapDetalle);
  
  const iconoCoche = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', 
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', 
    iconSize: [25, 41], 
    iconAnchor: [12, 41] 
  });
  
  const esReservado = vehiculo.value.estado === 'reservado';
  
  markerDetalle = L.marker([lat, lng], { 
    icon: iconoCoche, 
    draggable: esReservado 
  }).addTo(mapDetalle);
  
  // Evento al arrastrar el marcador (Solo si está reservado)
  if (esReservado) { 
    markerDetalle.on('dragend', () => { 
      const pos = markerDetalle.getLatLng(); 
      latDevolucion.value = parseFloat(pos.lat.toFixed(6)); 
      lngDevolucion.value = parseFloat(pos.lng.toFixed(6)); 
      traducirCoordenadas(latDevolucion.value, lngDevolucion.value); 
    }); 
  }
};

const devolverVehiculo = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/vehiculos/${vehiculoId}/devolver`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      credentials: 'include', 
      body: JSON.stringify({ 
        latitud: latDevolucion.value, 
        longitud: lngDevolucion.value, 
        incidenciaTexto: incidenciaDevolucion.value 
      }) 
    });
    
    if (res.ok) { 
      alert('Vehículo devuelto. ¡Gracias por usar FleetManager!'); 
      incidenciaDevolucion.value = ''; 
      cargarDetalles(); 
      cargarIncidencias(); 
    } else {
      alert('Error al devolver el vehículo.');
    }
  } catch (error) {
    console.error("Error al devolver:", error);
  }
};

const cargarIncidencias = async () => { 
  try { 
    const res = await fetch(`http://localhost:3000/api/incidencias/vehiculo/${vehiculoId}`, { credentials: 'include' }); 
    if (res.ok) incidencias.value = await res.json(); 
  } catch (e) {
    console.error(e);
  } 
};

const enviarIncidencia = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/incidencias', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      credentials: 'include', 
      body: JSON.stringify({ 
        texto: nuevaIncidencia.value, 
        vehiculoId: parseInt(vehiculoId) 
      }) 
    });
    if (res.ok) { 
      alert('Incidencia reportada correctamente.'); 
      nuevaIncidencia.value = ''; 
      cargarIncidencias(); 
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => { 
  cargarDetalles(); 
  cargarIncidencias(); 
});
</script>

<style scoped>
/* NAVBAR */
.navbar { background: var(--brand-primary); color: white; padding: 15px 0; box-shadow: var(--shadow-md); position: sticky; top: 0; z-index: 100; }
.nav-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.nav-brand { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; }

/* LAYOUT PRINCIPAL */
.detalle-container { max-width: 1200px; margin: 30px auto; padding: 0 20px; }
.cabecera-detalle { margin-bottom: 20px; }
.btn-ghost { background: transparent; color: var(--text-muted); border: none; font-weight: 600; cursor: pointer; padding: 5px 0; font-size: 1rem; transition: color 0.2s;}
.btn-ghost:hover { color: var(--brand-primary); }

.contenido-principal { display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; align-items: start; }
@media (max-width: 768px) { .contenido-principal { grid-template-columns: 1fr; } }

.card-style { background: var(--card-bg); padding: 25px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid #F1F5F9; }

/* PANEL IZQUIERDO: FICHA COCHE */
.titulo-coche { margin: 0 0 20px 0; font-size: 1.8rem; color: var(--text-main); font-weight: 800; text-transform: capitalize;}
.img-detalle { width: 100%; height: 350px; border-radius: var(--radius-md); object-fit: cover; margin-bottom: 25px; box-shadow: var(--shadow-sm); }

.grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
.info-item { display: flex; align-items: center; gap: 15px; background: var(--bg-app); padding: 15px; border-radius: var(--radius-md); border: 1px solid #E2E8F0;}
.icono { font-size: 1.8rem; }
.valor-info { margin: 2px 0 0 0; font-size: 1.1rem; color: var(--text-main); font-weight: 600; text-transform: capitalize; }

.seccion-titulo { margin: 0 0 15px 0; font-size: 1.2rem; color: var(--text-main); }
.direccion-texto { font-size: 1rem; font-weight: 600; color: var(--brand-primary); background: var(--brand-light); padding: 12px; border-radius: var(--radius-md); margin-bottom: 15px; border: 1px solid #E0E7FF; }
.buscador-direccion { display: flex; gap: 10px; margin-bottom: 15px; }
.buscador-direccion input { flex: 1; padding: 10px 15px; border: 1px solid #CBD5E1; border-radius: var(--radius-md); outline: none; transition: border-color 0.2s;}
.buscador-direccion input:focus { border-color: var(--brand-primary); }
.mapa-pequeno { height: 280px; width: 100%; border-radius: var(--radius-md); border: 2px solid white; box-shadow: var(--shadow-md); z-index: 1; }

/* PANEL DERECHO: INTERACCIÓN */
.columna-derecha { display: flex; flex-direction: column; gap: 20px; }

/* BLOQUE DEVOLUCIÓN */
.bloque-devolucion { background: linear-gradient(to bottom right, var(--success-bg), white); border-color: #A7F3D0; }
.titulo-destacado { color: #065F46; margin: 0 0 10px 0; font-size: 1.3rem; }
.desc-devolucion { color: #047857; font-size: 0.95rem; margin-bottom: 15px; line-height: 1.5; }
.label-incidencia { display: block; font-size: 0.85rem; font-weight: 600; color: #065F46; margin-bottom: 8px; }

.textarea-moderno { width: 100%; height: 90px; padding: 12px; border: 1px solid #CBD5E1; border-radius: var(--radius-md); resize: vertical; margin-bottom: 15px; box-sizing: border-box; font-family: inherit; transition: border-color 0.2s;}
.textarea-moderno:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 3px var(--brand-light); }

/* BOTONES */
.btn-brand, .btn-success { color: white; border: none; padding: 12px 20px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-brand { background: var(--brand-primary); }
.btn-brand:hover:not(:disabled) { background: var(--brand-hover); }
.btn-success { background: var(--success); }
.btn-success:hover { background: #059669; }
.btn-full { width: 100%; font-size: 1rem;}
.btn-brand:disabled { opacity: 0.6; cursor: not-allowed; }

.divisor { border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0; }

/* LISTA INCIDENCIAS */
.lista-incidencias { list-style: none; padding: 0; margin: 0; }
.tarjeta-incidencia { background: white; padding: 15px; border-radius: var(--radius-md); border-left: 4px solid var(--brand-primary); margin-bottom: 15px; box-shadow: var(--shadow-sm); border-top: 1px solid #F1F5F9; border-right: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; }
.cabecera-inc { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
.problema { font-size: 1rem; color: var(--text-main); margin: 0 0 12px 0; font-weight: 500; }
.resolucion { background: var(--bg-app); padding: 10px 12px; border-radius: 6px; }
.respuesta-admin { margin: 8px 0 0 0; font-size: 0.9rem; font-style: italic; color: var(--brand-primary); font-weight: 500; }

/* BADGES */
.badge-estado, .badge-inc { padding: 4px 10px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.disponible { background: var(--success-bg); color: #065F46; }
.reservado, .pendiente { background: var(--warning-bg); color: #92400E; }
.en-taller, .rechazada { background: var(--danger-bg); color: #991B1B; }
.resuelta { background: var(--success-bg); color: #065F46; }

/* ESTADO VACÍO (Sin incidencias) */
.sin-incidencias { text-align: center; padding: 30px; background: var(--success-bg); border-radius: var(--radius-md); color: #065F46; font-weight: 600; border: 1px dashed #A7F3D0;}
.icono-ok { font-size: 2rem; display: block; margin-bottom: 10px; }
.cargando { text-align: center; margin-top: 100px; font-size: 1.2rem; font-weight: 600; color: var(--text-muted); }
</style>