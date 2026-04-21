import { RegistroPage } from './page/Registro'

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">ReservaYa</p>
          <h1>Registro de reserva</h1>
          <p className="lead">Registra un cliente y su reserva en un único formulario.</p>
        </div>
      </header>

      <RegistroPage />

      <section className="future-panel">
        <h2>Próximo módulo</h2>
        <p>En la siguiente etapa añadiremos la gestión de reservas con horarios y disponibilidad.</p>
      </section>
    </main>
  )
}

export default App
