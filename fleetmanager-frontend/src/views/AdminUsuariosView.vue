<template>
  <div class="admin-container">
    <h2>Control de Conductores</h2>
    <p>Gestión y validación de documentación asociada.</p>
    
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Licencia</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in usuarios" :key="user._id">
          <td>{{ user.nombre }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.licencia }}</td>
          <td>{{ user.validado ? 'Validado' : 'Pendiente' }}</td>
          <td>
            <button v-if="!user.validado" @click="validarConductor(user._id)">
              Validar Conductor
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../services/api';

const usuarios = ref([]);

const cargarUsuarios = async () => {
  usuarios.value = await api.getUsuarios();
};

const validarConductor = async (id) => {
  try {
    await api.validarConductor(id);
    cargarUsuarios();
  } catch (error) {
    console.error('Error validando conductor', error);
  }
};

onMounted(() => {
  cargarUsuarios();
});
</script>

<style scoped>
.admin-container { padding: 20px; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
th { background-color: #f4f4f4; }
</style>