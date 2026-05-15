<template>
  <div class="layout-app">
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="nav-brand">FleetManager</h1>
        <button class="btn-logout" @click="cerrarSesion">Cerrar Sesión</button>
      </div>
    </nav>

    <div class="contenedor-principal">
      
      <section class="seccion-busqueda">
        <div class="buscador-card">
          <h2>Encuentra tu vehículo</h2>
          <div class="buscador-input">
            <input 
              v-model="direccion" 
              type="text" 
              placeholder="Introduce tu calle para ver coches cercanos..." 
              @keyup.enter="buscarUbicacion" 
            />
            <button class="btn-brand" @click="buscarUbicacion" :disabled="buscando">
              {{ buscando ? 'Buscando...' : 'Buscar Mapa' }}
            </button>
          </div>
        </div>
        <div id="map" class="mapa-principal"></div>
      </section>

      <div class="barra-herramientas">
        <h2>Catálogo de Flota</h2>
        <div class="filtro-moneda">
          <label>Divisa:</label>
          <select v-model="monedaActual" @change="cambiarDivisa">
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      <section class="grid-vehiculos">
        <div v-for="coche in vehiculos" :key="coche.id" class="tarjeta-coche">
          <div class="imagen-wrapper">
            <img :src="coche.imagen || 'https://via.placeholder.com/400x250?text=Sin+Foto'" alt="Coche" />
            <span :class="['estado-flotante', coche.estado.replace(' ', '-')]">
              {{ coche.estado.toUpperCase() }}
            </span>
          </div>
          
          <div class="info-coche">
            <h3>{{ coche.modelo }}</h3>
            
            <div class="detalles-rapidos">
              <span class="precio">
                {{ (coche.precioHora * tasaCambio).toFixed(2) }} {{ monedaActual }}<small>/h</small>
              </span>
              <span v-if="coche.distancia !== undefined" class="distancia">
                📍 a {{ coche.distancia.toFixed(1) }} km
              </span>
            </div>
            
            <div class="botones-coche">
              <button class="btn-outline" @click="verDetalles(coche.id)">
                Ver Detalles
              </button>
              <button 
                class="btn-brand" 
                :disabled="coche.estado !== 'disponible'" 
                @click="hacerReserva(coche)"
              >
                {{ coche.estado === 'disponible' ? 'Reservar' : 'No Disponible' }}
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import emailjs from '@emailjs/browser';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';


const router = useRouter();

// --- ESTADOS ---
const vehiculos = ref([]);
const direccion = ref('');
const coordenadasUsuario = ref(null);
const buscando = ref(false);
const monedaActual = ref('EUR');
const tasaCambio = ref(1); 

// --- MAPA ---
let map = null;
let marcadores = [];
let marcadorUsuario = null;

// --- CLAVES REALES ---
const KEYS = { 
  OPENCAGE: '9585c88d5e604d57b2bb360359642da6', 
  EMAILJS_SERVICE: 'service_fqyxezk', 
  EMAILJS_TEMPLATE: 'template_913ls1t', 
  EMAILJS_PUBLIC: 'K823OOXIYOTnbIdcf' 
};

// --- ICONOS DEL MAPA ---
const crearIcono = (color) => new L.Icon({ 
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`, 
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', 
  iconSize: [25, 41], 
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34], 
  shadowSize: [41, 41] 
});
const iconoVerde = crearIcono('green'); 
const iconoRojo = crearIcono('red'); 
const iconoAzul = crearIcono('blue');

// --- FUNCIONES DE VEHÍCULOS ---
const cargarVehiculos = async () => {
  try {
    const data = await api.getVehiculos(); // [cite: 82, 115]
    vehiculos.value = data;
    actualizarMapa();
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
  }
};

// --- FUNCIONES DE MAPA ---
const inicializarMapa = () => {
  const centro = coordenadasUsuario.value || { lat: 37.3891, lng: -5.9845 }; 
  map = L.map('map').setView([centro.lat, centro.lng], coordenadasUsuario.value ? 14 : 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  actualizarMarcadores();
};

const actualizarMarcadores = () => {
  if (!map) return;
  
  // Limpiamos los anteriores
  marcadores.forEach(m => map.removeLayer(m));
  marcadores = [];
  
  // Añadimos los nuevos
  vehiculos.value.forEach(coche => {
    if (coche.latitud && coche.longitud) {
      const icono = coche.estado === 'disponible' ? iconoVerde : iconoRojo;
      const marker = L.marker([coche.latitud, coche.longitud], { icon: icono }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif;">
          <h4 style="margin: 0 0 5px 0; color: #4F46E5;">${coche.modelo}</h4>
          <p style="margin:0;">${coche.precioHora}€/h</p>
        </div>
      `);
      marcadores.push(marker);
    }
  });
};

const buscarUbicacion = async () => {
  if (!direccion.value) return alert("Introduce una dirección");
  buscando.value = true;
  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(direccion.value)}&key=${KEYS.OPENCAGE}`);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      coordenadasUsuario.value = { lat, lng };
      
      // Mover el mapa a la nueva ubicación
      if (map) {
        map.setView([lat, lng], 14);
        if (marcadorUsuario) map.removeLayer(marcadorUsuario);
        marcadorUsuario = L.marker([lat, lng], { icon: iconoAzul }).addTo(map).bindPopup("<b>Tu ubicación</b>").openPopup();
      }
      
      // Recalcular distancias a todos los coches
      vehiculos.value.forEach(coche => {
        if(coche.latitud && coche.longitud) {
          coche.distancia = calcularDistancia(lat, lng, coche.latitud, coche.longitud);
        }
      });
      // Ordenar por cercanía
      vehiculos.value.sort((a, b) => (a.distancia || 9999) - (b.distancia || 9999));
    } else { 
      alert("No se encontró la dirección."); 
    }
  } catch (error) { 
    console.error("Error geocodificando:", error); 
  } finally { 
    buscando.value = false; 
  }
};

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180; 
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
};

// --- FUNCIONES EXTRA (Divisas, Reservas, Navegación) ---
const cambiarDivisa = async () => {
  if (monedaActual.value === 'EUR') { 
    tasaCambio.value = 1; 
    return; 
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR');
    const data = await res.json(); 
    tasaCambio.value = data.rates[monedaActual.value];
  } catch (error) { 
    console.error("Error al obtener divisas:", error);
    monedaActual.value = 'EUR'; 
  }
};

const hacerReserva = async (coche) => {
  try {
    await api.crearReserva({ idVehiculo: coche.id }); 
    alert(`Reserva confirmada`);
    cargarVehiculos();
  } catch (error) {
    alert(error.message);
  }
};

const verDetalles = (id) => { 
  router.push(`/vehiculo/${id}`); 
};

const cerrarSesion = () => { 
  localStorage.removeItem('usuarioId'); 
  localStorage.removeItem('usuarioRol'); 
  router.push('/'); 
};

// --- INICIO ---
onMounted(() => { 
  cargarVehiculos(); 
  inicializarMapa(); 
});
</script>

<style scoped>
/* NAVBAR DE MARCA */
.navbar { 
  background: var(--brand-primary); 
  color: white; 
  padding: 15px 0; 
  box-shadow: var(--shadow-md); 
  position: sticky; 
  top: 0; 
  z-index: 100; 
}
.nav-content { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 20px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.nav-brand { 
  margin: 0; 
  font-size: 1.5rem; 
  font-weight: 800; 
  letter-spacing: -0.5px; 
}
.btn-logout { 
  background: rgba(255,255,255,0.2); 
  color: white; 
  border: none; 
  padding: 8px 16px; 
  border-radius: 50px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: 0.2s; 
}
.btn-logout:hover { 
  background: rgba(255,255,255,0.3); 
}

/* CONTENEDOR CENTRAL */
.contenedor-principal { 
  max-width: 1200px; 
  margin: 30px auto; 
  padding: 0 20px; 
}

/* BÚSQUEDA Y MAPA */
.seccion-busqueda { 
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
  margin-bottom: 40px; 
}
.buscador-card { 
  background: var(--card-bg); 
  padding: 20px; 
  border-radius: var(--radius-lg); 
  box-shadow: var(--shadow-sm); 
}
.buscador-card h2 { 
  margin: 0 0 15px 0; 
  font-size: 1.2rem; 
  color: var(--text-main); 
}
.buscador-input { 
  display: flex; 
  gap: 10px; 
}
.buscador-input input { 
  flex: 1; 
  padding: 12px 15px; 
  border: 1px solid #CBD5E1; 
  border-radius: var(--radius-md); 
  font-size: 1rem; 
}
.buscador-input input:focus { 
  outline: none; 
  border-color: var(--brand-primary); 
  box-shadow: 0 0 0 3px var(--brand-light); 
}
.mapa-principal { 
  height: 350px; 
  width: 100%; 
  border-radius: var(--radius-lg); 
  border: 2px solid white; 
  box-shadow: var(--shadow-md); 
  z-index: 1; 
}

/* BARRA DE HERRAMIENTAS */
.barra-herramientas { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20px; 
}
.barra-herramientas h2 { 
  margin: 0; 
  color: var(--text-main); 
  font-size: 1.4rem; 
}
.filtro-moneda { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  font-weight: 600; 
  color: var(--text-muted); 
}
.filtro-moneda select { 
  padding: 8px 12px; 
  border-radius: var(--radius-md); 
  border: 1px solid #CBD5E1; 
  font-weight: 600; 
  cursor: pointer; 
}

/* TARJETAS DE COCHES */
.grid-vehiculos { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
  gap: 25px; 
}
.tarjeta-coche { 
  background: var(--card-bg); 
  border-radius: var(--radius-lg); 
  overflow: hidden; 
  box-shadow: var(--shadow-md); 
  transition: transform 0.2s ease, box-shadow 0.2s ease; 
  border: 1px solid #F1F5F9; 
  display: flex; 
  flex-direction: column; 
}
.tarjeta-coche:hover { 
  transform: translateY(-5px); 
  box-shadow: var(--shadow-lg); 
}

.imagen-wrapper { 
  position: relative; 
  height: 180px; 
}
.imagen-wrapper img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}
.estado-flotante { 
  position: absolute; 
  top: 10px; 
  right: 10px; 
  padding: 6px 12px; 
  border-radius: 50px; 
  font-size: 0.8rem; 
  font-weight: 800; 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
}

.disponible { background-color: var(--success); color: white; }
.reservado { background-color: var(--warning); color: white; }
.en-taller { background-color: var(--danger); color: white; }

.info-coche { 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  flex: 1; 
  justify-content: space-between; 
}
.info-coche h3 { 
  margin: 0 0 10px 0; 
  font-size: 1.25rem; 
  color: var(--text-main); 
}
.detalles-rapidos { 
  display: flex; 
  justify-content: space-between; 
  align-items: baseline; 
  margin-bottom: 20px; 
}
.precio { 
  font-size: 1.4rem; 
  font-weight: 800; 
  color: var(--brand-primary); 
}
.precio small { 
  font-size: 0.9rem; 
  color: var(--text-muted); 
  font-weight: 500; 
}
.distancia { 
  font-size: 0.9rem; 
  font-weight: 600; 
  color: var(--text-muted); 
  background: var(--bg-app); 
  padding: 4px 8px; 
  border-radius: var(--radius-md); 
}

/* BOTONES */
.botones-coche { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 10px; 
}
.btn-brand { 
  background: var(--brand-primary); 
  color: white; 
  border: none; 
  padding: 10px; 
  border-radius: var(--radius-md); 
  font-weight: 600; 
  cursor: pointer; 
  transition: 0.2s; 
  text-align: center; 
}
.btn-brand:hover:not(:disabled) { 
  background: var(--brand-hover); 
}
.btn-brand:disabled { 
  background: #CBD5E1; 
  cursor: not-allowed; 
}

.btn-outline { 
  background: transparent; 
  color: var(--brand-primary); 
  border: 2px solid var(--brand-primary); 
  padding: 8px; 
  border-radius: var(--radius-md); 
  font-weight: 600; 
  cursor: pointer; 
  transition: 0.2s; 
  text-align: center; 
}
.btn-outline:hover { 
  background: var(--brand-light); 
}
</style>