<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <header class="brand-logo">
        <span class="icon">🚙</span>
        <h2>Únete a FleetManager</h2>
      </header>
      <p class="subtitle">Crea tu cuenta y empieza a conducir.</p>

      <form @submit.prevent="registrarUsuario" class="form-container">
        <div class="input-group">
          <label>Nombre completo</label>
          <input v-model="form.nombre" type="text" placeholder="Ej: Juan Pérez" required />
        </div>
        
        <div class="input-group">
          <label>Correo electrónico</label>
          <input v-model="form.email" type="email" placeholder="tu@email.com" required />
        </div>
        
        <div class="input-group">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" placeholder="Crea una contraseña segura" required />
        </div>
        
        <div class="input-row">
          <div class="input-group">
            <label>Nº de Carnet</label>
            <input v-model="form.licencia" type="text" placeholder="12345678A" required />
          </div>
          <div class="input-group">
            <label>Perfil</label>
            <select v-model="form.rol" required>
              <option value="estandar">Conductor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        
        <div v-if="error" class="alerta error">{{ error }}</div>
        <div v-if="exito" class="alerta exito">{{ exito }}</div>

        <button type="submit" class="btn-brand" :disabled="cargando">
          {{ cargando ? 'Registrando...' : 'Completar Registro' }}
        </button>
      </form>

      <footer class="enlace-footer">
        <p>¿Ya tienes cuenta? <router-link to="/">Inicia sesión aquí</router-link></p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Estado del formulario
const form = ref({ 
  nombre: '', 
  email: '', 
  password: '',
  licencia: '',
  rol: 'estandar' 
});

const error = ref('');
const exito = ref('');
const cargando = ref(false);

const registrarUsuario = async () => {
  error.value = '';
  exito.value = '';
  cargando.value = true;

  // Validación rápida del carnet antes de enviarlo al servidor
  const regexCarnet = /^[0-9]{8}[A-Za-z]$/;
  if (!regexCarnet.test(form.value.licencia)) {
    error.value = "El formato de carnet es inválido (8 números y 1 letra).";
    cargando.value = false;
    return; 
  }

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await res.json();

    if (res.ok) {
      exito.value = "¡Registro exitoso! Redirigiendo al login...";
      setTimeout(() => {
        router.push('/'); 
      }, 2000);
    } else {
      error.value = data.error || "Hubo un problema al registrar el usuario.";
    }
  } catch (err) {
    console.error("Error conectando con el servidor:", err);
    error.value = "Error de conexión. Asegúrate de que el backend está encendido.";
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.auth-wrapper { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 100vh; 
  padding: 20px; 
}

.auth-card { 
  background: var(--card-bg); 
  width: 100%; 
  max-width: 480px; 
  padding: 40px; 
  border-radius: var(--radius-lg); 
  box-shadow: var(--shadow-lg); 
  text-align: center; 
}

.brand-logo { margin-bottom: 5px; }
.brand-logo .icon { font-size: 2.5rem; display: block; margin-bottom: 10px; }
.brand-logo h2 { margin: 0; color: var(--brand-primary); font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; }
.subtitle { color: var(--text-muted); margin-bottom: 25px; font-size: 0.95rem; }

.form-container { display: flex; flex-direction: column; gap: 15px; text-align: left; }

.input-group label { 
  display: block; 
  font-size: 0.85rem; 
  font-weight: 600; 
  color: var(--text-main); 
  margin-bottom: 6px; 
}

.input-group input, .input-group select { 
  width: 100%; 
  padding: 12px 15px; 
  border: 1px solid #CBD5E1; 
  border-radius: var(--radius-md); 
  font-size: 0.95rem; 
  box-sizing: border-box; 
  transition: all 0.3s; 
  background: white;
}

.input-group input:focus, .input-group select:focus { 
  outline: none; 
  border-color: var(--brand-primary); 
  box-shadow: 0 0 0 3px var(--brand-light); 
}

.input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

.alerta { 
  padding: 12px; 
  border-radius: var(--radius-md); 
  font-size: 0.9rem; 
  font-weight: 600; 
  text-align: center; 
}

.error { 
  background-color: var(--danger-bg); 
  color: var(--danger); 
  border: 1px solid rgba(239, 68, 68, 0.3); 
}

.exito { 
  background-color: var(--success-bg); 
  color: var(--success); 
  border: 1px solid rgba(16, 185, 129, 0.3); 
}

.btn-brand { 
  background: var(--brand-primary); 
  color: white; 
  border: none; 
  padding: 14px; 
  border-radius: var(--radius-md); 
  font-size: 1rem; 
  font-weight: 600; 
  cursor: pointer; 
  transition: background 0.3s ease; 
  margin-top: 10px; 
}

.btn-brand:hover:not(:disabled) { background: var(--brand-hover); }
.btn-brand:disabled { opacity: 0.7; cursor: not-allowed; }

.enlace-footer { margin-top: 25px; font-size: 0.9rem; color: var(--text-muted); }
.enlace-footer a { color: var(--brand-primary); text-decoration: none; font-weight: 600; }
.enlace-footer a:hover { text-decoration: underline; }
</style>