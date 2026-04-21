import type { ReservationFields, ReservaPayload } from '../types'

export function buildReservaPayload(values: ReservationFields): ReservaPayload {
  return {
    estado: false,
    fechaReservacion: values.fechaReservacion,
    MesaidMesa: values.mesaId,
    HorarioidHorario: values.horarioId,
    Observacion: values.observacion?.trim() || undefined,
  }
}

export default buildReservaPayload
