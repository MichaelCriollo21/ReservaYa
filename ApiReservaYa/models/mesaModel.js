const pool = require('../config/db')

const Mesa = {
  obtenerDisponibles: async (fechaReservacion) => {
    if (!fechaReservacion) {
      const [rows] = await pool.execute(
        'SELECT idMesa AS id, capacidad FROM Mesa WHERE estado = 1'
      )
      return rows
    }

    const [rows] = await pool.execute(
      `SELECT m.idMesa AS id, m.capacidad
       FROM Mesa m
       WHERE m.estado = 1
         AND m.idMesa NOT IN (
           SELECT MesaidMesa
           FROM Reserva
           WHERE fechaReservacion = ?
         )`,
      [fechaReservacion]
    )

    return rows
  },

  obtenerPorIdParaReserva: async (connection, idMesa) => {
    const [rows] = await connection.execute(
      'SELECT idMesa, estado FROM Mesa WHERE idMesa = ? FOR UPDATE',
      [idMesa]
    )

    return rows[0] || null
  },

  actualizarEstado: async (connection, idMesa, estado) => {
    await connection.execute(
      'UPDATE Mesa SET estado = ? WHERE idMesa = ?',
      [estado, idMesa]
    )
  },
}

module.exports = Mesa
