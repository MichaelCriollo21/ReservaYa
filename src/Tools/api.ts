import type { MesaModel } from '../models/mesas'
import type { ReservaPayload } from '../types'

type ApiListResponse<T> = {
  data?: T
  message?: string
}

async function getErrorMessage(res: Response) {
  const text = await res.text()

  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string }
    return parsed.message || parsed.error || text || `HTTP ${res.status}`
  } catch {
    return text || `HTTP ${res.status}`
  }
}

export async function getAvailableTables(fechaReservacion?: string) {
  const base = getApiBaseUrl()
  const url = new URL(`${base.replace(/\/$/, '')}/api/mesas`)

  if (fechaReservacion) {
    url.searchParams.set('fecha', fechaReservacion)
  }

  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  const result: ApiListResponse<MesaModel[]> | MesaModel[] = await res.json()
  return Array.isArray(result) ? result : result.data ?? []
}

export async function createReservation(payload: ReservaPayload) {
  const base = getApiBaseUrl()
  const url = `${base.replace(/\/$/, '')}/api/reservas`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return res.json()
}

export default { createReservation, getAvailableTables }

export function getApiBaseUrl() {
  return (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000'
}
