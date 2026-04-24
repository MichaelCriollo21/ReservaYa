export interface ReservaInterface {
  idReserva?: number
  estado: boolean
  fechaReservacion: string
  MesaidMesa: string
  UsuarioidUsuario?: number | string
  nombre: string
  telefono: string
  correo: string
  numeroReserva?: string
  observacion?: string
  estadoMesa?: number
}
