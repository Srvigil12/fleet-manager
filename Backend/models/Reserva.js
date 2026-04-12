const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  usuarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  vehiculoId: { 
    type: Number, // Guardamos el ID del coche de MySQL
    required: true 
  },
  fechaReserva: { 
    type: Date, 
    default: Date.now 
  },
  estado: { 
    type: String, 
    enum: ['activa', 'finalizada'], 
    default: 'activa' 
  }
});

module.exports = mongoose.model('Reserva', reservaSchema);