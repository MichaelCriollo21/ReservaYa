const pool = require('../config/db');

const Reserva = {
  crear: async ({ estado, fechaReservacion, MesaidMesa, UsuarioidUsuario, Nombre, Telefono, Correo, NumeroReserva, Observacion }) => {
    const [result] = await pool.execute(
      'INSERT INTO Reserva (estado, fechaReservacion, MesaidMesa, UsuarioidUsuario, Nombre, Telefono, Correo, NumeroReserva, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [estado ? 1 : 0, fechaReservacion, MesaidMesa, UsuarioidUsuario, Nombre, Telefono, Correo, NumeroReserva, Observacion || null]
    );
    return result;
  },
  buscarPorId: async (idReserva) => {
    const [result] = await pool.execute('SELECT * FROM Reserva WHERE idReserva = ?', [idReserva]);
    return result;
  }
};

module.exports = Reserva;
