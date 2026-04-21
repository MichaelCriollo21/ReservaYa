export const messages = {
  requiredName: 'El nombre del cliente es obligatorio.',
  requiredEmail: 'El correo es obligatorio.',
  invalidEmail: 'Ingresa un correo válido.',
  requiredPhone: 'El teléfono es obligatorio.',
  invalidPhone: 'El teléfono debe contener entre 7 y 15 dígitos.',
  requiredDate: 'La fecha y hora de la reserva son obligatorias.',
  selectHorario: 'Selecciona un horario.',
  selectMesa: 'Selecciona una mesa.',
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isPhoneValid(value: string) {
  return /^\d{7,15}$/.test(value.trim())
}

export default { messages, isEmail, isPhoneValid }
