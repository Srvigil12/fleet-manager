<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="brand-logo">
        <span class="icon">🚙</span>
        <h1>FleetManager</h1>
      </div>
      <p class="subtitle">Bienvenido de nuevo</p>

      <form @submit.prevent="iniciarSesion" class="form-container">
        <div class="input-group">
          <label>Correo Electrónico</label>
          <input v-model="email" type="email" placeholder="tu@email.com" required />
        </div>
        <div class="input-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn-brand">Iniciar Sesión</button>
      </form>
      <p class="enlace-footer">¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref(''); 

const iniciarSesion = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('usuarioId', data.id); 
      localStorage.setItem('usuarioRol', data.rol); 
      localStorage.setItem('usuarioNombre', data.nombre); 
      localStorage.setItem('usuarioEmail', data.email); 
      
      if (data.rol === 'admin') {
        router.push('/admin'); 
      } else {
        router.push('/usuario'); 
      }
    } else {
      const errorData = await res.json();
      alert(errorData.error || "Credenciales incorrectas");
    }
  } catch (error) { 
    console.error("Error al iniciar sesión:", error); 
    alert("Error de conexión con el servidor.");
  }
};
</script>

<style scoped>
.auth-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
.auth-card { background: var(--card-bg); width: 100%; max-width: 400px; padding: 40px; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); text-align: center; }

.brand-logo { margin-bottom: 5px; }
.brand-logo .icon { font-size: 3rem; display: block; margin-bottom: 10px; }
.brand-logo h1 { margin: 0; color: var(--brand-primary); font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; }
.subtitle { color: var(--text-muted); margin-bottom: 30px; font-size: 0.95rem; }

.form-container { display: flex; flex-direction: column; gap: 20px; text-align: left; }
.input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
.input-group input { width: 100%; padding: 12px 15px; border: 1px solid #CBD5E1; border-radius: var(--radius-md); font-size: 1rem; box-sizing: border-box; transition: all 0.3s ease; background: white;}
.input-group input:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 3px var(--brand-light); }

.btn-brand { background: var(--brand-primary); color: white; border: none; padding: 14px; border-radius: var(--radius-md); font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.3s ease; margin-top: 10px; }
.btn-brand:hover { background: var(--brand-hover); }

.enlace-footer { margin-top: 25px; font-size: 0.9rem; color: var(--text-muted); }
.enlace-footer a { color: var(--brand-primary); text-decoration: none; font-weight: 600; }
.enlace-footer a:hover { text-decoration: underline; }
</style>