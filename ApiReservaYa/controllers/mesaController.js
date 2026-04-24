const Mesa = require('../models/mesaModel');

const obtenerMesas = async (req, res) => {
  try {
    const { fecha } = req.query;
    const mesas = await Mesa.obtenerDisponibles(fecha);
    res.json({ data: mesas });
  } catch (err) {
    console.error('Error obtenerMesas:', err);
    res.status(500).json({ error: 'Error al obtener mesas' });
  }
};

module.exports = { obtenerMesas };
