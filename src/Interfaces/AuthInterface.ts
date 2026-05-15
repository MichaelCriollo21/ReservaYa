export interface LoginFields {
  correo: string
  contrasenia: string
}

export interface AuthUser {
  idUsuario?: number
  nombre: string
  rol: string
}

export interface AuthSession {
  access_token: string
  user: AuthUser
}
