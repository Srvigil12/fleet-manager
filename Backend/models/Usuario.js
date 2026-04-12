const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  licencia: { type: String, required: true }, 
  rol: { type: String, enum: ['admin', 'estandar'], default: 'estandar' },
  validado: { type: Boolean, default: false } 
});

module.exports = mongoose.model('Usuario', usuarioSchema);