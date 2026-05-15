import { useState } from 'react'
import { Boton } from './componentes/Boton'
import type { AuthSession } from './Interfaces/AuthInterface'
import { LoginPage } from './page/Login'
import { RegistroPage } from './page/Reservas'
import { clearSession, getStoredSession } from './Tools/api'

function canManageReservations(session: AuthSession | null) {
  return session?.user.rol === 'ADMINISTRADOR' || session?.user.rol === 'OPERARIO'
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession())
  const [showLogin, setShowLogin] = useState(false)
  const [showProtectedPanel, setShowProtectedPanel] = useState(false)

  const privileged = canManageReservations(session)

  const handleLogout = () => {
    clearSession()
    setSession(null)
    setShowLogin(false)
    setShowProtectedPanel(false)
  }

  return (
    <main className="min-vh-100 reservas-bg py-5 reservas-app">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <header className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 text-white mb-4">
              <div>
                <p className="text-uppercase fw-semibold small mb-2 reservas-kicker">ReservaYa</p>
                <h1 className="display-6 fw-bold mb-2">Panel de reservas</h1>
                <p className="mb-0 text-white-50">
                  {session
                    ? `Sesion activa: ${session.user.nombre} (${session.user.rol})`
                    : 'Puedes crear reservas sin iniciar sesion. Usa el menu superior solo para acceder a las acciones protegidas.'}
                </p>
              </div>

              <nav className="d-flex align-items-center gap-2 reservas-top-menu">
                <Boton type="button" className="px-4 text-nowrap reservas-nav-button">
                  Reservas
                </Boton>

                <Boton
                  type="button"
                  className="px-4 text-nowrap reservas-nav-button"
                  onClick={() => setShowProtectedPanel((current) => !current)}
                  disabled={!privileged}
                >
                  Acciones protegidas
                </Boton>

                {session ? (
                  <Boton
                    type="button"
                    className="px-4 text-nowrap reservas-nav-button"
                    onClick={handleLogout}
                  >
                    Cerrar sesion
                  </Boton>
                ) : (
                  <Boton
                    type="button"
                    className="px-4 text-nowrap reservas-nav-button"
                    onClick={() => setShowLogin((current) => !current)}
                  >
                    Iniciar sesion
                  </Boton>
                )}
              </nav>
            </header>

            {showLogin && !session ? (
              <div className="mb-4">
                <LoginPage onLogin={setSession} onClose={() => setShowLogin(false)} />
              </div>
            ) : null}

            <RegistroPage session={session} showProtectedPanel={showProtectedPanel} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
