import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UsuarioView from '../views/UsuarioView.vue'
import AdminView from '../views/AdminView.vue'
import VehiculoDetalleView from '../views/VehiculoDetalleView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/usuario',
      name: 'usuario',
      component: UsuarioView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/vehiculo/:id',
      name: 'vehiculo-detalle',
      component: VehiculoDetalleView
    }
  ]
})

export default router