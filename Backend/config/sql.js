const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.SQL_DATABASE, 
  process.env.SQL_USER, 
  process.env.SQL_PASSWORD, 
  {
    host: process.env.SQL_HOST,
    dialect: 'mysql',
    logging: false 
  }
);

const connectSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔵 Conectado a MySQL (Vehículos)');
  } catch (error) {
    console.error('🔴 Error conectando a MySQL:', error);
  }
};

module.exports = { sequelize, connectSQL };