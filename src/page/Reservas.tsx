import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Boton } from '../componentes/Boton'
import { Campo, CampoSelect } from '../componentes/Campos'
import { TextoAyuda, TituloSeccion } from '../componentes/Titulos'
import type { AuthSession } from '../Interfaces/AuthInterface'
import type { MesaInterface } from '../Interfaces/MesaInterface'
import type { ReservaInterface } from '../Interfaces/ReservaInterface'
import { useForm } from '../hooks/useForm'
import {
  createReservation,
  findReservationByNumber,
  getAvailableTables,
  getReservationHistory,
  getReservations,
  updateReservationStatus,
} from '../Tools/api'
import { isEmail, isPhoneValid, messages } from '../Tools/validation'

const initialValues: ReservaInterface = {
  nombre: '',
  telefono: '',
  correo: '',
  fechaReservacion: '',
  horaInicio: '',
  horaFin: '',
  idMesa: '',
}

const customerFields = [
  { id: 'nombre', label: 'Nombre', autoComplete: 'name', placeholder: 'Nombre completo', type: 'text' },
  { id: 'telefono', label: 'Telefono', autoComplete: 'tel', placeholder: '3001234567', type: 'tel' },
  { id: 'correo', label: 'Correo electronico', autoComplete: 'email', placeholder: 'cliente@correo.com', type: 'email' },
] as const

const protectedTableColumns = [
  'Numero',
  'Nombre',
  'Correo',
  'Telefono',
  'Fecha',
  'Horario',
  'Mesa',
  'Estado',
  'Gestionada por',
  'Acciones',
] as const

const validateReserva = (values: ReservaInterface) => {
  const errors: Partial<Record<keyof ReservaInterface, string>> = {}

  if (!values.nombre.trim()) errors.nombre = messages.requiredName
  if (!values.correo.trim()) errors.correo = messages.requiredEmail
  else if (!isEmail(values.correo)) errors.correo = messages.invalidEmail
  if (!String(values.telefono).trim()) errors.telefono = messages.requiredPhone
  else if (!isPhoneValid(String(values.telefono))) errors.telefono = messages.invalidPhone
  if (!values.fechaReservacion.trim()) errors.fechaReservacion = messages.requiredDate
  if (!values.horaInicio.trim()) errors.horaInicio = 'La hora de inicio es obligatoria.'
  if (!values.horaFin.trim()) errors.horaFin = 'La hora de fin es obligatoria.'
  if (values.horaInicio && values.horaFin && values.horaFin <= values.horaInicio) {
    errors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio.'
  }
  if (!values.idMesa) errors.idMesa = messages.selectMesa

  return errors
}

function getMinDateValue() {
  return new Date().toISOString().slice(0, 10)
}

function formatReservationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short' }).format(date)
}

function canManageReservations(session: AuthSession | null) {
  return session?.user.rol === 'ADMINISTRADOR' || session?.user.rol === 'OPERARIO'
}

function matchesSearch(reserva: ReservaInterface, term: string) {
  const normalizedTerm = term.trim().toLowerCase()
  if (!normalizedTerm) return true

  return [
    reserva.numeroReserva,
    reserva.nombre,
    reserva.correo,
    String(reserva.telefono ?? ''),
    reserva.estado,
    String(reserva.mesa?.numeroMesa ?? reserva.idMesa ?? ''),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedTerm))
}

type RegistroPageProps = {
  session: AuthSession | null
  showProtectedPanel?: boolean
}

export function RegistroPage({ session, showProtectedPanel = false }: RegistroPageProps) {
  const [mesas, setMesas] = useState<MesaInterface[]>([])
  const [reservas, setReservas] = useState<ReservaInterface[]>([])
  const [historial, setHistorial] = useState<ReservaInterface[]>([])
  const [resultadoBusqueda, setResultadoBusqueda] = useState<ReservaInterface | null>(null)
  const [numeroBusqueda, setNumeroBusqueda] = useState('')
  const [isLoadingMesas, setIsLoadingMesas] = useState(false)
  const [isLoadingReservas, setIsLoadingReservas] = useState(false)
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNoTablesAlert, setShowNoTablesAlert] = useState(false)

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm<ReservaInterface>(
    initialValues,
    validateReserva,
  )

  const privileged = canManageReservations(session)
  const managementReservations = historial.length > 0 ? historial : reservas
  const filteredManagementReservations = managementReservations.filter((reserva) =>
    matchesSearch(reserva, numeroBusqueda),
  )

  useEffect(() => {
    let mounted = true

    const loadMesas = async () => {
      setIsLoadingMesas(true)
      try {
        const result = await getAvailableTables()
        if (!mounted) return
        setMesas(result)
        setShowNoTablesAlert(result.length === 0)
      } catch (error) {
        if (!mounted) return
        setMesas([])
        setShowNoTablesAlert(false)
        await Swal.fire({
          icon: 'error',
          title: 'No pudimos cargar las mesas',
          text: error instanceof Error ? error.message : 'Intenta nuevamente en unos segundos.',
          confirmButtonText: 'Entendido',
        })
      } finally {
        if (mounted) setIsLoadingMesas(false)
      }
    }

    if (!session) {
      setReservas([])
      setHistorial([])
      setResultadoBusqueda(null)
      loadMesas()
      return () => {
        mounted = false
      }
    }

    const loadReservas = async () => {
      if (!privileged) return
      setIsLoadingReservas(true)
      try {
        const result = await getReservations()
        if (!mounted) return
        setReservas(result)
      } catch (error) {
        if (!mounted) return
        setReservas([])
        await Swal.fire({
          icon: 'error',
          title: 'No pudimos cargar las reservas activas',
          text: error instanceof Error ? error.message : 'Intenta nuevamente en unos segundos.',
          confirmButtonText: 'Entendido',
        })
      } finally {
        if (mounted) setIsLoadingReservas(false)
      }
    }

    const loadHistorial = async () => {
      if (!privileged) return
      setIsLoadingHistorial(true)
      try {
        const result = await getReservationHistory()
        if (!mounted) return
        setHistorial(result)
      } catch (error) {
        if (!mounted) return
        setHistorial([])
        await Swal.fire({
          icon: 'error',
          title: 'No pudimos cargar el historial',
          text: error instanceof Error ? error.message : 'Intenta nuevamente en unos segundos.',
          confirmButtonText: 'Entendido',
        })
      } finally {
        if (mounted) setIsLoadingHistorial(false)
      }
    }

    loadMesas()
    loadReservas()
    loadHistorial()

    return () => {
      mounted = false
    }
  }, [session, privileged])

  const onSubmit = async (formValues: ReservaInterface) => {
    setIsSubmitting(true)
    try {
      const reserva = await createReservation({
        nombre: formValues.nombre.trim(),
        telefono: Number(String(formValues.telefono).trim()),
        correo: formValues.correo.trim(),
        fechaReservacion: formValues.fechaReservacion,
        horaInicio: formValues.horaInicio,
        horaFin: formValues.horaFin,
        idMesa: Number(formValues.idMesa),
      })

      if (privileged) {
        setReservas((current) => [reserva, ...current].slice(0, 10))
        setHistorial((current) => [reserva, ...current].slice(0, 10))
      }
      resetForm()

      await Swal.fire({
        icon: 'success',
        title: 'Reserva registrada',
        text: `La reserva ${reserva.numeroReserva} fue creada correctamente.`,
        confirmButtonText: 'Perfecto',
      })
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'No pudimos guardar la reserva',
        text: error instanceof Error ? error.message : 'Verifica los datos e intenta nuevamente.',
        confirmButtonText: 'Revisar',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = async () => {
    if (!numeroBusqueda.trim()) return
    setIsSearching(true)
    try {
      const result = await findReservationByNumber(numeroBusqueda.trim())
      setResultadoBusqueda(result)
    } catch (error) {
      setResultadoBusqueda(null)
      await Swal.fire({
        icon: 'error',
        title: 'No pudimos buscar la reserva',
        text: error instanceof Error ? error.message : 'Intenta nuevamente.',
        confirmButtonText: 'Revisar',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleStatusChange = async (reserva: ReservaInterface, nuevoEstado: 'CANCELADA' | 'FINALIZADA') => {
    if (!session?.user.idUsuario || !reserva.idReserva) return
    try {
      const updated = await updateReservationStatus(reserva.idReserva, nuevoEstado, session.user.idUsuario)
      setReservas((current) => current.map((item) => (item.idReserva === updated.idReserva ? updated : item)))
      setHistorial((current) => current.map((item) => (item.idReserva === updated.idReserva ? updated : item)))
      if (resultadoBusqueda?.idReserva === updated.idReserva) {
        setResultadoBusqueda(updated)
      }
      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La reserva ${updated.numeroReserva} ahora está ${updated.estado}.`,
        confirmButtonText: 'Entendido',
      })
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'No pudimos actualizar el estado',
        text: error instanceof Error ? error.message : 'Intenta nuevamente.',
        confirmButtonText: 'Revisar',
      })
    }
  }

  const mesaOptions = mesas.map((mesa) => ({
    value: String(mesa.idMesa),
    label: `Mesa ${mesa.numeroMesa} - capacidad ${mesa.capacidad}`,
  }))

  return (
    <section className="card border-0 shadow-lg reservas-card">
      <div className="card-body p-4 p-lg-5">
        <div className="row g-4 align-items-start">
          {!showProtectedPanel ? (
            <div className="col-12">
              <div className="mb-4">
                <TituloSeccion>Crear reserva</TituloSeccion>
                <TextoAyuda>
                  {session
                    ? 'Conectado a la API nueva de mesas, reservas y autenticacion.'
                    : 'Puedes crear una reserva sin iniciar sesion. El login queda solo para las acciones protegidas.'}
                </TextoAyuda>
              </div>

              {showNoTablesAlert ? (
                <div className="alert alert-warning" role="alert">
                  Sin mesas disponibles.
                </div>
              ) : null}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="reserva-form-layout">
                <section className="reserva-form-section">
                  <h3 className="h5 fw-semibold text-dark mb-3">Datos del cliente</h3>
                  <div className="row g-3">
                    {customerFields.map((field, index) => (
                      <Campo
                        key={field.id}
                        id={field.id}
                        name={field.id}
                        label={field.label}
                        type={field.type}
                        value={String(values[field.id])}
                        onChange={handleChange}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        error={errors[field.id]}
                        wrapperClassName={index < 2 ? 'col-12 col-md-6' : 'col-12'}
                      />
                    ))}
                  </div>
                </section>

                <section className="reserva-form-section">
                  <h3 className="h5 fw-semibold text-dark mb-3">Detalles de la reserva</h3>
                  <div className="row g-3">
                    <Campo
                      id="fechaReservacion"
                      name="fechaReservacion"
                      label="Fecha"
                      type="date"
                      value={values.fechaReservacion}
                      onChange={handleChange}
                      error={errors.fechaReservacion}
                      min={getMinDateValue()}
                      wrapperClassName="col-12 col-md-4"
                    />
                    <Campo
                      id="horaInicio"
                      name="horaInicio"
                      label="Hora inicio"
                      type="time"
                      value={values.horaInicio}
                      onChange={handleChange}
                      error={errors.horaInicio}
                      wrapperClassName="col-12 col-md-4"
                    />
                    <Campo
                      id="horaFin"
                      name="horaFin"
                      label="Hora fin"
                      type="time"
                      value={values.horaFin}
                      onChange={handleChange}
                      error={errors.horaFin}
                      wrapperClassName="col-12 col-md-4"
                    />
                    <CampoSelect
                      id="idMesa"
                      name="idMesa"
                      label="Mesa disponible"
                      value={String(values.idMesa)}
                      onChange={handleChange}
                      options={mesaOptions}
                      error={errors.idMesa}
                      disabled={isLoadingMesas}
                      placeholder={
                        isLoadingMesas
                          ? 'Cargando mesas...'
                          : 'Selecciona una mesa'
                      }
                      wrapperClassName="col-12"
                    />
                  </div>
                </section>

                <div className="d-flex flex-column flex-sm-row gap-2 pt-2">
                  <Boton type="submit" className="px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar reserva'}
                  </Boton>
                  <Boton type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting}>
                    Limpiar formulario
                  </Boton>
                </div>
              </form>
            </div>
          ) : null}

          {showProtectedPanel ? (
            <div className="col-12">
              <aside className="resumen-panel h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h5 fw-bold mb-0">Acciones protegidas</h3>
                    <p className="small text-secondary mb-0">
                      Consulta, busca y gestiona reservas en una sola tabla.
                    </p>
                  </div>
                </div>

                {!privileged ? (
                  <div className="alert alert-light border mb-0">
                    Inicia sesion con un usuario `ADMINISTRADOR` u `OPERARIO` para habilitar historial, busqueda por numero
                    y actualizacion de estado.
                  </div>
                ) : (
                  <div className="d-grid gap-4">
                    <section className="reserva-form-section">
                      <label htmlFor="numeroBusqueda" className="form-label fw-semibold">
                        Buscar reserva
                      </label>
                      <div className="row g-2 align-items-end">
                        <div className="col-12 col-lg-8">
                          <input
                            id="numeroBusqueda"
                            className="form-control"
                            value={numeroBusqueda}
                            onChange={(event) => setNumeroBusqueda(event.target.value)}
                            placeholder="Busca por numero, nombre, correo, telefono, mesa o estado"
                          />
                        </div>
                        <div className="col-12 col-lg-4">
                          <Boton type="button" className="w-100" onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? 'Buscando...' : 'Buscar exacta'}
                          </Boton>
                        </div>
                      </div>

                      {resultadoBusqueda ? (
                        <div className="alert alert-light border mt-3 mb-0 reserva-search-result">
                          <div className="fw-bold text-dark mb-2">{resultadoBusqueda.numeroReserva}</div>
                          <div><strong>Nombre:</strong> {resultadoBusqueda.nombre}</div>
                          <div><strong>Correo:</strong> {resultadoBusqueda.correo}</div>
                          <div><strong>Telefono:</strong> {resultadoBusqueda.telefono}</div>
                          <div><strong>Fecha:</strong> {formatReservationDate(resultadoBusqueda.fechaReservacion)}</div>
                          <div><strong>Horario:</strong> {resultadoBusqueda.horaInicio} - {resultadoBusqueda.horaFin}</div>
                          <div><strong>Estado:</strong> {resultadoBusqueda.estado}</div>
                          <div><strong>Mesa:</strong> {resultadoBusqueda.mesa?.numeroMesa ?? resultadoBusqueda.idMesa}</div>
                          <div><strong>Gestionada por:</strong> {resultadoBusqueda.usuario?.nombre ?? 'Sin asignar'}</div>
                        </div>
                      ) : null}
                    </section>

                    <section>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="h6 fw-bold mb-0">Tabla de reservas</h4>
                        <span className="small text-secondary">
                          {filteredManagementReservations.length} resultado(s)
                        </span>
                      </div>
                      <div className="table-responsive reservas-table-wrap reservas-table-management">
                        <table className="table align-middle mb-0">
                          <thead>
                            <tr>
                              {protectedTableColumns.map((column) => (
                                <th key={column}>{column}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {isLoadingReservas || isLoadingHistorial ? (
                              <tr>
                                <td colSpan={protectedTableColumns.length} className="text-center text-secondary py-4">
                                  Cargando...
                                </td>
                              </tr>
                            ) : filteredManagementReservations.length > 0 ? (
                              filteredManagementReservations.map((reserva) => (
                                <tr key={`protected-${reserva.idReserva ?? reserva.numeroReserva}`}>
                                  <td>{reserva.numeroReserva}</td>
                                  <td>{reserva.nombre}</td>
                                  <td>{reserva.correo}</td>
                                  <td>{reserva.telefono}</td>
                                  <td>{formatReservationDate(reserva.fechaReservacion)}</td>
                                  <td>{reserva.horaInicio} - {reserva.horaFin}</td>
                                  <td>{reserva.mesa?.numeroMesa ?? reserva.idMesa}</td>
                                  <td>{reserva.estado}</td>
                                  <td>{reserva.usuario?.nombre ?? 'Sin asignar'}</td>
                                  <td>
                                    {reserva.estado === 'INGRESADA' ? (
                                      <div className="d-flex flex-column gap-2 reservas-action-buttons">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleStatusChange(reserva, 'CANCELADA')}
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-success"
                                          onClick={() => handleStatusChange(reserva, 'FINALIZADA')}
                                        >
                                          Finalizar
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-secondary small">Sin cambios</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={protectedTableColumns.length} className="text-center text-secondary py-4">
                                  No encontramos reservas con ese criterio.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                )}
              </aside>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
