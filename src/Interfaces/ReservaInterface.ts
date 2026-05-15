import type { MesaInterface } from './MesaInterface'

export interface ReservaInterface {
  idReserva?: number
  numeroReserva?: string
  nombre: string
  telefono: string | number
  correo: string
  fechaReservacion: string
  horaInicio: string
  horaFin: string
  idMesa: number | ''
  estado?: string
  mesa?: MesaInterface
  usuario?: {
    idUsuario?: number
    nombre?: string
    rol?: string
  }
}
