const jwt = require('jsonwebtoken');

// Barrera 1: Comprueba si el usuario tiene una sesión iniciada válida
const verificarToken = (req, res, next) => {
  const token = req.cookies.token; // Leemos la cookie que configuramos en el login

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. Inicia sesión primero.' });
  }

  try {
    // Intentamos descifrar el token usando tu palabra secreta
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado; // Guardamos el ID y el rol en la petición para usarlos luego
    next(); // ¡Todo correcto! Dejamos pasar al usuario a la ruta solicitada
  } catch (error) {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' });
  }
};

// Barrera 2: Comprueba si el usuario además es Administrador
const esAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para administradores.' });
  }
  next(); // Es admin, lo dejamos pasar
};

module.exports = { verificarToken, esAdmin };