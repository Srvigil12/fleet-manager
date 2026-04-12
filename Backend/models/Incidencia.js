const mongoose = require('mongoose');

const incidenciaSchema = new mongoose.Schema({
  usuarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  vehiculoId: { 
    type: Number, // Guardamos el ID de MySQL
    required: true 
  },
  texto: { 
    type: String, 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'aceptada', 'rechazada', 'resuelta'], 
    default: 'pendiente' 
  },
  respuestaAdmin: { 
    type: String, 
    default: '' // Aquí el admin escribirá cómo se solucionó
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Incidencia', incidenciaSchema);