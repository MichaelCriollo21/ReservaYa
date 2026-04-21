export type HorarioModel = {
  id: string
  bloque: string
  hora: string
}

export const horarios: HorarioModel[] = [
  { id: '1', bloque: 'Mañana', hora: '09:00 - 11:00' },
  { id: '2', bloque: 'Mediodía', hora: '12:00 - 14:00' },
  { id: '3', bloque: 'Tarde', hora: '19:00 - 21:00' },
]

export default horarios
