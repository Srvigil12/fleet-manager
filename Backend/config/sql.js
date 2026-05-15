const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', // ESTO DEBE DECIR POSTGRES
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  },
  logging: false 
});
const connectSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔵 Conectado a MySQL (Vehículos)');
  } catch (error) {
    console.error('🔴 Error conectando a MySQL:', error);
  }
};

module.exports = { sequelize, connectSQL };