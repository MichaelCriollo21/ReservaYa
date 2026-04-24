export const messages = {
  requiredName: 'El nombre del cliente es obligatorio.',
  requiredEmail: 'El correo es obligatorio.',
  invalidEmail: 'Ingresa un correo valido.',
  requiredPhone: 'El telefono es obligatorio.',
  invalidPhone: 'El telefono debe contener entre 7 y 15 digitos.',
  requiredDate: 'La fecha y hora de la reserva son obligatorias.',
  selectMesa: 'Selecciona una mesa.',
  invalidPastDate: 'La reserva no puede ser anterior a la fecha y hora actual.',
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isPhoneValid(value: string) {
  return /^\d{7,15}$/.test(value.trim())
}

export default { messages, isEmail, isPhoneValid }
