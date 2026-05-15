import type { AuthSession, LoginFields } from '../Interfaces/AuthInterface'
import type { MesaInterface } from '../Interfaces/MesaInterface'
import type { ReservaInterface } from '../Interfaces/ReservaInterface'

const AUTH_STORAGE_KEY = 'reservaya.auth'

async function getErrorMessage(res: Response) {
  const text = await res.text()

  try {
    const parsed = JSON.parse(text) as { message?: string | string[]; error?: string }

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(', ')
    }

    return parsed.message || parsed.error || text || `HTTP ${res.status}`
  } catch {
    return text || `HTTP ${res.status}`
  }
}

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized)
    return JSON.parse(decoded) as { sub?: number; email?: string; rol?: string }
  } catch {
    return {}
  }
}

function normalizeSession(session: AuthSession) {
  const payload = decodeJwtPayload(session.access_token)

  return {
    ...session,
    user: {
      ...session.user,
      idUsuario: payload.sub ?? session.user.idUsuario,
      rol: payload.rol ?? session.user.rol,
    },
  }
}

function buildAuthHeaders() {
  const session = getStoredSession()

  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}
}

export async function login(payload: LoginFields) {
  const base = getApiBaseUrl()
  const url = `${base.replace(/\/$/, '')}/auth/login`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return normalizeSession((await res.json()) as AuthSession)
}

export async function getAvailableTables() {
  const base = getApiBaseUrl()
  const url = `${base.replace(/\/$/, '')}/mesa`

  const res = await fetch(url, {
    headers: {
      ...buildAuthHeaders(),
    },
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return (await res.json()) as MesaInterface[]
}

export async function createReservation(payload: ReservaInterface) {
  const base = getApiBaseUrl()
  const url = `${base.replace(/\/$/, '')}/reservas/crearReserva`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return (await res.json()) as ReservaInterface
}

export async function getReservations() {
  const base = getApiBaseUrl()
  const url = `${base.replace(/\/$/, '')}/reservas/listarReservas`

  const res = await fetch(url, {
    headers: {
      ...buildAuthHeaders(),
    },
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return (await res.json()) as ReservaInterface[]
}

export async function getReservationHistory() {
  const base = getApiBaseUrl()
  const url = `${base.replace(/\/$/, '')}/reservas/historial`

  const res = await fetch(url, {
    headers: {
      ...buildAuthHeaders(),
    },
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return (await res.json()) as ReservaInterface[]
}

export async function findReservationByNumber(numeroReserva: string) {
  const base = getApiBaseUrl()
  const url = `${base.replace(/\/$/, '')}/reservas/buscar/${encodeURIComponent(numeroReserva)}`

  const res = await fetch(url, {
    headers: {
      ...buildAuthHeaders(),
    },
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return (await res.json()) as ReservaInterface
}

export async function updateReservationStatus(
  idReserva: number,
  nuevoEstado: 'INGRESADA' | 'CANCELADA' | 'FINALIZADA',
  idUsuario: number,
) {
  const base = getApiBaseUrl()
  const url = `${base.replace(/\/$/, '')}/reservas/${idReserva}/status`

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ nuevoEstado, idUsuario }),
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return (await res.json()) as ReservaInterface
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizeSession(session)))
}

export function getStoredSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return normalizeSession(JSON.parse(raw) as AuthSession)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getApiBaseUrl() {
  return (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000'
}
