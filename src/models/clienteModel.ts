import type { ReservationFields, ClientePayload } from '../types'

export function buildClientePayload(values: ReservationFields): ClientePayload {
  return {
    Nombre: values.clienteNombre.trim(),
    Telefono: values.clienteTelefono.trim(),
    Correo: values.clienteCorreo.trim(),
  }
}

export default buildClientePayload
