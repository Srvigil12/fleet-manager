require('dotenv').config();
const express = require('express');
const cors = require('cors');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const connectMongo = require('./config/mongo');
const { connectSQL, sequelize } = require('./config/sql');

const Usuario = require('./models/Usuario');
const Vehiculo = require('./models/Vehiculo');
const Incidencia = require('./models/Incidencia');
const Reserva = require('./models/Reserva'); // <-- NUEVO MODELO IMPORTADO

const { verificarToken, esAdmin } = require('./middleware/auth');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

connectMongo();
connectSQL();

sequelize.sync({ alter: true }).then(async () => {
  try {
    const count = await Vehiculo.count();
    if (count === 0) {
      await Vehiculo.bulkCreate([
        { modelo: 'Toyota Yaris', imagen: 'https://images.unsplash.com/photo-1590362891991-f7004f21d3f3?w=500&q=80', precioHora: 12.5, estado: 'disponible', latitud: 37.3891, longitud: -5.9845, km: 15200, motor: 'híbrido' },
        { modelo: 'Tesla Model 3', imagen: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&q=80', precioHora: 25.0, estado: 'disponible', latitud: 37.3925, longitud: -5.9731, km: 8500, motor: 'eléctrico' },
        { modelo: 'Renault Clio', imagen: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?w=500&q=80', precioHora: 10.0, estado: 'en taller', latitud: 37.3800, longitud: -5.9950, km: 45300, motor: 'gasolina' }
      ]);
      console.log('🚗 Base de datos MySQL inicializada.');
    }
  } catch (error) { console.error('Error insertando vehículos:', error); }
});

const calcularDistanciaKM = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};


// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { nombre, email, password, licencia, rol } = req.body;
  const regexCarnet = /^[0-9]{8}[A-Z]$/i;
  if (!regexCarnet.test(licencia)) return res.status(400).json({ error: 'Formato de licencia inválido' });

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword, licencia, rol: rol || 'estandar' });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) { res.status(500).json({ error: 'Error al registrar usuario.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const esPasswordValida = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValida) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    
    // AQUÍ ESTÁ EL CAMBIO: Ahora mandamos también el nombre y el email al frontend
    res.json({ 
      id: usuario._id, 
      nombre: usuario.nombre, 
      email: usuario.email, 
      rol: usuario.rol, 
      validado: usuario.validado 
    });
  } catch (error) { res.status(500).json({ error: 'Error en el servidor' }); }
});

// ==========================================
// RUTAS DE USUARIOS
// ==========================================
app.get('/api/usuarios', verificarToken, esAdmin, async (req, res) => {
  try { res.json(await Usuario.find({ rol: 'estandar' })); } catch (error) { res.status(500).json({ error: 'Error al obtener usuarios' }); }
});

app.put('/api/usuarios/:id/validar', verificarToken, esAdmin, async (req, res) => {
  try { await Usuario.findByIdAndUpdate(req.params.id, { validado: true }); res.json({ mensaje: 'Conductor validado' }); } catch (error) { res.status(500).json({ error: 'Error al validar' }); }
});

// ==========================================
// RUTAS DE VEHÍCULOS Y RESERVAS
// ==========================================
app.post('/api/vehiculos', verificarToken, esAdmin, async (req, res) => {
  try { const nuevoVehiculo = await Vehiculo.create(req.body); res.status(201).json({ vehiculo: nuevoVehiculo }); } catch (error) { res.status(500).json({ error: 'Error al crear' }); }
});

app.put('/api/vehiculos/:id', verificarToken, esAdmin, async (req, res) => {
  try { const v = await Vehiculo.findByPk(req.params.id); await v.update(req.body); res.json({ vehiculo: v }); } catch (error) { res.status(500).json({ error: 'Error al actualizar' }); }
});

app.delete('/api/vehiculos/:id', verificarToken, esAdmin, async (req, res) => {
  try { const v = await Vehiculo.findByPk(req.params.id); await v.destroy(); res.json({ mensaje: 'Eliminado' }); } catch (error) { res.status(500).json({ error: 'Error al eliminar' }); }
});

app.get('/api/vehiculos', verificarToken, async (req, res) => {
  try { res.json(await Vehiculo.findAll()); } catch (error) { res.status(500).json({ error: 'Error al cargar' }); }
});

app.get('/api/vehiculos/:id', verificarToken, async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id);
    if (!vehiculo) return res.status(404).json({ error: 'Coche no encontrado' });
    res.json(vehiculo);
  } catch (error) { res.status(500).json({ error: 'Error al cargar el coche' }); }
});

// NUEVA LÓGICA DE RESERVAS
app.post('/api/reservas', verificarToken, async (req, res) => {
  try {
    const v = await Vehiculo.findByPk(req.body.idVehiculo);
    if (!v || v.estado !== 'disponible') return res.status(400).json({ error: 'No disponible' });
    
    // 1. Cambiamos el estado del coche
    v.estado = 'reservado'; 
    await v.save(); 

    // 2. CREAMOS EL REGISTRO DE LA RESERVA
    const nuevaReserva = new Reserva({
      usuarioId: req.usuario.id,
      vehiculoId: v.id
    });
    await nuevaReserva.save();

    res.json({ vehiculo: v });
  } catch (error) { res.status(500).json({ error: 'Error en reserva' }); }
});

app.get('/api/reservas', verificarToken, esAdmin, async (req, res) => {
  try {
    // Obtenemos las reservas y sacamos los datos del usuario que la hizo
    const reservas = await Reserva.find().populate('usuarioId', 'nombre email licencia').sort({ fechaReserva: -1 });
    res.json(reservas);
  } catch (error) { res.status(500).json({ error: 'Error al cargar reservas' }); }
});

app.post('/api/vehiculos/:id/devolver', verificarToken, async (req, res) => {
  try {
    const { latitud, longitud, incidenciaTexto } = req.body;
    const vehiculo = await Vehiculo.findByPk(req.params.id);

    if (!vehiculo || vehiculo.estado !== 'reservado') {
      return res.status(400).json({ error: 'El vehículo no está reservado.' });
    }

    if (vehiculo.latitud && vehiculo.longitud && latitud && longitud) {
      const distanciaViaje = calcularDistanciaKM(vehiculo.latitud, vehiculo.longitud, latitud, longitud);
      if (distanciaViaje > 0) vehiculo.km = vehiculo.km + Math.round(distanciaViaje);
    }

    vehiculo.latitud = latitud;
    vehiculo.longitud = longitud;
    vehiculo.estado = 'disponible';
    await vehiculo.save();

    // FINALIZAMOS LA RESERVA ACTIVA
    const reserva = await Reserva.findOne({ vehiculoId: vehiculo.id, estado: 'activa' });
    if (reserva) {
      reserva.estado = 'finalizada';
      await reserva.save();
    }

    if (incidenciaTexto && incidenciaTexto.trim() !== '') {
      const nuevaIncidencia = new Incidencia({ usuarioId: req.usuario.id, vehiculoId: vehiculo.id, texto: incidenciaTexto });
      await nuevaIncidencia.save();
    }

    res.json({ mensaje: 'Vehículo devuelto exitosamente', vehiculo });
  } catch (error) { res.status(500).json({ error: 'Error al devolver el vehículo' }); }
});

// ==========================================
// RUTAS DE INCIDENCIAS
// ==========================================
app.post('/api/incidencias', verificarToken, async (req, res) => {
  try {
    const { texto, vehiculoId } = req.body;
    const nuevaIncidencia = new Incidencia({ usuarioId: req.usuario.id, vehiculoId, texto });
    await nuevaIncidencia.save();
    res.status(201).json({ mensaje: 'Incidencia reportada con éxito' });
  } catch (error) { res.status(500).json({ error: 'Error al reportar' }); }
});

app.get('/api/incidencias', verificarToken, esAdmin, async (req, res) => {
  try { res.json(await Incidencia.find().populate('usuarioId', 'nombre email').sort({ fecha: -1 })); } catch (error) { res.status(500).json({ error: 'Error al cargar incidencias' }); }
});

app.get('/api/incidencias/vehiculo/:vehiculoId', verificarToken, async (req, res) => {
  try { res.json(await Incidencia.find({ vehiculoId: req.params.vehiculoId }).populate('usuarioId', 'nombre').sort({ fecha: -1 })); } catch (error) { res.status(500).json({ error: 'Error al cargar incidencias' }); }
});

app.put('/api/incidencias/:id', verificarToken, esAdmin, async (req, res) => {
  try {
    const { estado, respuestaAdmin } = req.body; 
    const incidencia = await Incidencia.findByIdAndUpdate(req.params.id, { estado, respuestaAdmin }, { new: true });
    res.json({ incidencia });
  } catch (error) { res.status(500).json({ error: 'Error al actualizar' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`🚀 Servidor corriendo en el puerto ${PORT}`); });