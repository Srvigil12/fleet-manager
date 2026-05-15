# FleetManager - Guía de Arranque del Proyecto

Esta es la guía paso a paso para configurar y levantar los servidores del MVP de FleetManager en un entorno local.

## 1. Requisitos Previos
Antes de iniciar, asegúrate de tener instalados e iniciados los siguientes servicios:
* **Node.js** (v16 o superior).
* **MySQL**: Debes tener un servidor MySQL en ejecución (por ejemplo, a través de XAMPP). Crea una base de datos vacía llamada `fleet_db`.
* **MongoDB**: Instancia local o cluster en MongoDB Atlas.

## 2. Configuración de Variables de Entorno (.env)

El proyecto requiere dos archivos `.env` (uno para el Backend y otro para el Frontend) para funcionar correctamente sin exponer credenciales. 

### Backend
1. Navega a la carpeta `/Backend`.
2. Renombra el archivo `.env.example` a `.env` (o crea uno nuevo llamado `.env`).
3. Asegúrate de que contenga tus credenciales locales:
```env
PORT=3000
DATABASE_URL=mysql://root:@localhost:3306/fleet_db
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/fleetmanager
JWT_SECRET=tu_clave_secreta

### Frontend
Abre otra terminal y ejecuta:
1. `cd fleetmanager-frontend`
2. `npm install`
3. `npm run dev`
La aplicación estará disponible en `http://localhost:5173` (puerto por defecto de Vite).