import Swal from 'sweetalert2'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campos'
import { TextoAyuda, TituloSeccion } from '../componentes/Titulos'
import type { AuthSession, LoginFields } from '../Interfaces/AuthInterface'
import { useForm } from '../hooks/useForm'
import { isEmail, messages } from '../Tools/validation'
import { login, saveSession } from '../Tools/api'

const initialValues: LoginFields = {
  correo: '',
  contrasenia: '',
}

const validateLogin = (values: LoginFields) => {
  const errors: Partial<Record<keyof LoginFields, string>> = {}

  if (!values.correo.trim()) {
    errors.correo = messages.requiredEmail
  } else if (!isEmail(values.correo)) {
    errors.correo = messages.invalidEmail
  }

  if (!values.contrasenia.trim()) {
    errors.contrasenia = 'La contrasenia es obligatoria.'
  } else if (values.contrasenia.trim().length < 8) {
    errors.contrasenia = 'La contrasenia debe tener al menos 8 caracteres.'
  }

  return errors
}

type LoginPageProps = {
  onLogin: (session: AuthSession) => void
  onClose?: () => void
}

export function LoginPage({ onLogin, onClose }: LoginPageProps) {
  const { values, errors, handleChange, handleSubmit } = useForm<LoginFields>(
    initialValues,
    validateLogin,
  )

  const onSubmit = async (formValues: LoginFields) => {
    try {
      const session = await login({
        correo: formValues.correo.trim(),
        contrasenia: formValues.contrasenia.trim(),
      })

      saveSession(session)
      onLogin(session)
      onClose?.()
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'No pudimos iniciar sesion',
        text: error instanceof Error ? error.message : 'Verifica tus credenciales.',
        confirmButtonText: 'Revisar',
      })
    }
  }

  return (
    <section className="card border-0 shadow-lg reservas-card login-card">
      <div className="card-body p-4 p-lg-5">
        <TituloSeccion>Iniciar sesion</TituloSeccion>
        <TextoAyuda className="mb-4">
          Ingresa con tu cuenta del sistema para consultar mesas y reservas activas.
        </TextoAyuda>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="reserva-form-layout">
          <section className="reserva-form-section">
            <div className="row g-3">
              <Campo
                id="correo"
                name="correo"
                label="Correo"
                type="email"
                value={values.correo}
                onChange={handleChange}
                autoComplete="email"
                placeholder="usuario@correo.com"
                error={errors.correo}
                wrapperClassName="col-12"
              />

              <Campo
                id="contrasenia"
                name="contrasenia"
                label="Contrasenia"
                type="password"
                value={values.contrasenia}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="********"
                error={errors.contrasenia}
                wrapperClassName="col-12"
              />
            </div>
          </section>

          <div className="d-flex flex-column flex-sm-row gap-2">
            <Boton type="submit" className="px-4">
              Entrar
            </Boton>
            {onClose ? (
              <Boton type="button" variant="secondary" onClick={onClose}>
                Cerrar
              </Boton>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  )
}
