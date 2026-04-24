const pool = require('../config/db')

const Reserva = {
  listarRecientes: async (limit = 10) => {
    const [rows] = await pool.execute(
      `SELECT numeroReserva, nombre, fechaReservacion
       FROM Reserva
       ORDER BY fechaReservacion DESC, idReserva DESC
       LIMIT ?`,
      [limit]
    )

    return rows
  },

  obtenerSiguienteNumero: async (connection) => {
    const [countRows] = await connection.execute('SELECT COUNT(*) as cnt FROM Reserva')
    const count =
      countRows && countRows[0] && countRows[0].cnt ? Number(countRows[0].cnt) : 0

    return `RF-${String(count + 1).padStart(3, '0')}`
  },

  crear: async (
    connection,
    {
      estado,
      fechaReservacion,
      MesaidMesa,
      UsuarioidUsuario,
      nombre,
      telefono,
      correo,
      numeroReserva,
      observacion,
    },
  ) => {
    const [result] = await connection.execute(
      `INSERT INTO Reserva (
        estado,
        fechaReservacion,
        MesaidMesa,
        UsuarioidUsuario,
        nombre,
        telefono,
        correo,
        numeroReserva,
        observacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        estado ? 1 : 0,
        fechaReservacion,
        MesaidMesa,
        UsuarioidUsuario,
        nombre,
        telefono,
        correo,
        numeroReserva,
        observacion || null,
      ]
    )

    return result
  },
}

module.exports = Reserva
