export interface RegisterFields {
  fullName: string
  email: string
  password: string
  phone: string
}

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
}

export interface ReservationFields {
  clienteNombre: string
  clienteTelefono: string
  clienteCorreo: string
  fechaReservacion: string
  horarioId: string
  mesaId: string
  observacion?: string
}

export interface ClientePayload {
  Nombre: string
  Telefono: string
  Correo: string
}

export interface ReservaPayload {
  estado: boolean
  fechaReservacion: string
  MesaidMesa: string
  UsuarioidUsuario?: string
  HorarioidHorario: string
  ClienteIdCliente?: string
  Observacion?: string
}

type ValidationErrors<T> = Partial<Record<keyof T, string>>

export type FormValues<T> = T

export type FormErrors<T> = ValidationErrors<T>
