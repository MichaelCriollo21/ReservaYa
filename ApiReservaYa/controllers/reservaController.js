const pool = require('../config/db')
const Mesa = require('../models/mesaModel')
const Reserva = require('../models/Reserva')

const listarReservas = async (_req, res) => {
  try {
    const reservas = await Reserva.listarRecientes()
    return res.json({ ok: true, data: reservas })
  } catch (err) {
    console.error('Error listarReservas:', err)
    return res.status(500).json({ ok: false, message: 'Error al obtener reservas' })
  }
}

const crearReserva = async (req, res) => {
  const reserva = req.body || {}
  const { nombre, telefono, correo, fechaReservacion, MesaidMesa, observacion } = reserva

  if (!nombre || !telefono || !correo || !fechaReservacion || !MesaidMesa) {
    return res.status(400).json({ ok: false, message: 'Faltan campos requeridos' })
  }

  const reservationDate = new Date(fechaReservacion)
  if (Number.isNaN(reservationDate.getTime())) {
    return res.status(400).json({ ok: false, message: 'Fecha invalida' })
  }

  const now = new Date()
  if (reservationDate < now) {
    return res.status(400).json({
      ok: false,
      message: 'La fecha de reserva no puede ser anterior a la fecha actual',
    })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const mesa = await Mesa.obtenerPorIdParaReserva(connection, MesaidMesa)

    if (!mesa) {
      await connection.rollback()
      return res.status(404).json({ ok: false, message: 'La mesa seleccionada no existe' })
    }

    if (Number(mesa.estado) === 0) {
      await connection.rollback()
      return res.status(400).json({
        ok: false,
        message: 'La mesa seleccionada no esta disponible',
      })
    }

    const numeroReserva = await Reserva.obtenerSiguienteNumero(connection)
    const UsuarioidUsuario = reserva.UsuarioidUsuario || 1

    const result = await Reserva.crear(connection, {
      estado: false,
      fechaReservacion: reservationDate,
      MesaidMesa,
      UsuarioidUsuario,
      nombre,
      telefono,
      correo,
      numeroReserva,
      observacion,
    })

    await Mesa.actualizarEstado(connection, MesaidMesa, 0)
    await connection.commit()

    return res.status(201).json({
      ok: true,
      data: {
        idReserva: result.insertId,
        estado: 0,
        fechaReservacion: reservationDate,
        MesaidMesa,
        UsuarioidUsuario,
        nombre,
        telefono,
        correo,
        numeroReserva,
        observacion: observacion || null,
        estadoMesa: 0,
      },
    })
  } catch (err) {
    await connection.rollback()
    console.error('Error crearReserva:', err)
    return res.status(500).json({ ok: false, message: 'Error al crear reserva' })
  } finally {
    connection.release()
  }
}

module.exports = { crearReserva, listarReservas }
