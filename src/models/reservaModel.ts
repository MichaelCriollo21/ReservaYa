import type { ReservationFields, ReservaPayload } from '../types'

export function buildReservaPayload(values: ReservationFields): ReservaPayload {
  return {
    estado: false,
    fechaReservacion: values.fechaReservacion,
    MesaidMesa: values.mesaId,
    Nombre: values.clienteNombre.trim(),
    Telefono: values.clienteTelefono.trim(),
    Correo: values.clienteCorreo.trim(),
    Observacion: values.observacion?.trim() || undefined,
  }
}

export default buildReservaPayload
