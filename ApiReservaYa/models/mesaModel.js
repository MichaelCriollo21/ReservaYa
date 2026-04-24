const pool = require('../config/db');

const Mesa = {

  obtenerTodas: async () => {
    const [rows] = await pool.execute('SELECT idMesa AS id, capacidad, estado FROM Mesa');
    return rows;
  },
  
  obtenerDisponibles: async (fechaReservacion) => {
    if (!fechaReservacion) {
      const [rows] = await pool.execute('SELECT idMesa AS id, capacidad FROM Mesa WHERE estado = 1');
      return rows;
    }

    const [rows] = await pool.execute(
      `SELECT m.idMesa AS id, m.capacidad, m.estado
       FROM Mesa m
       WHERE m.estado = 1
         AND m.idMesa NOT IN (SELECT MesaidMesa FROM Reserva WHERE fechaReservacion = ?)`,
      [fechaReservacion]
    );
    return rows;
  },
};

module.exports = Mesa;
