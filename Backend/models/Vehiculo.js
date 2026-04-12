const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sql');

const Vehiculo = sequelize.define('Vehiculo', {
  modelo: { type: DataTypes.STRING, allowNull: false },
  imagen: { type: DataTypes.STRING, allowNull: true },
  precioHora: { type: DataTypes.FLOAT, allowNull: false },
  estado: { 
    type: DataTypes.ENUM('disponible', 'reservado', 'en taller'), 
    defaultValue: 'disponible' 
  },
  latitud: { type: DataTypes.FLOAT, allowNull: true },
  longitud: { type: DataTypes.FLOAT, allowNull: true },
  
  // NUEVOS CAMPOS
  km: { type: DataTypes.INTEGER, defaultValue: 0 },
  motor: { 
    type: DataTypes.ENUM('gasolina', 'diésel', 'eléctrico', 'híbrido'), 
    defaultValue: 'gasolina' 
  }
});

module.exports = Vehiculo;