const pool = require('../config/db')

// POST /api/reservas
// Expects body: { Nombre, Telefono, Correo, fechaReservacion, MesaidMesa }
const crearReserva = async (req, res) => {
  const reserva = req.body || {}

  const { Nombre, Telefono, Correo, fechaReservacion, MesaidMesa } = reserva

  if (!Nombre || !Telefono || !Correo || !fechaReservacion || !MesaidMesa) {
    return res.status(400).json({ ok: false, message: 'Faltan campos requeridos' })
  }

  const reservationDate = new Date(fechaReservacion)
  if (Number.isNaN(reservationDate.getTime())) {
    return res.status(400).json({ ok: false, message: 'Fecha invalida' })
  }

  const now = new Date()
  if (reservationDate < now) {
    return res.status(400).json({ ok: false, message: 'La fecha de reserva no puede ser anterior a la fecha actual' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [countRows] = await connection.execute('SELECT COUNT(*) as cnt FROM Reserva')
    const count = (countRows && countRows[0] && countRows[0].cnt) ? Number(countRows[0].cnt) : 0
    const next = count + 1
    const NumeroReserva = `RF-${String(next).padStart(3, '0')}`

    const UsuarioidUsuario = reserva.UsuarioidUsuario || 1

    const [result] = await connection.execute(
      'INSERT INTO Reserva (estado, fechaReservacion, MesaidMesa, UsuarioidUsuario, Nombre, Telefono, Correo, NumeroReserva) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [0, reservationDate, MesaidMesa, UsuarioidUsuario, Nombre, Telefono, Correo, NumeroReserva]
    )

    await connection.commit()

    const creado = {
      idReserva: result.insertId,
      estado: 0,
      fechaReservacion: reservationDate,
      MesaidMesa,
      UsuarioidUsuario,
      Nombre,
      Telefono,
      Correo,
      NumeroReserva,
    }

    return res.status(201).json({ ok: true, data: creado })
  } catch (err) {
    await connection.rollback()
    console.error('Error crearReserva:', err)
    return res.status(500).json({ ok: false, message: 'Error al crear reserva' })
  } finally {
    connection.release()
  }
}

module.exports = { crearReserva }
