import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Boton } from '../componentes/Boton'
import { Campo, CampoSelect } from '../componentes/Campos'
import { TituloSeccion } from '../componentes/Titulos'
import type { ReservaInterface } from '../Interfaces/ReservaInterface'
import type { MesaInterface } from '../Interfaces/MesaInterface'
import { useForm } from '../hooks/useForm'
import { createReservation, getAvailableTables, getReservations } from '../Tools/api'
import { isEmail, isPhoneValid, messages } from '../Tools/validation'

const initialValues: ReservaInterface = {
  estado: false,
  fechaReservacion: '',
  MesaidMesa: '',
  nombre: '',
  telefono: '',
  correo: '',
  observacion: '',
}

const customerFields = [
  {
    id: 'nombre',
    label: 'Nombre',
    autoComplete: 'name',
    placeholder: 'Nombre completo',
    type: 'text',
  },
  {
    id: 'telefono',
    label: 'Telefono',
    autoComplete: 'tel',
    placeholder: '3001234567',
    type: 'tel',
  },
  {
    id: 'correo',
    label: 'Correo electronico',
    autoComplete: 'email',
    placeholder: 'cliente@correo.com',
    type: 'email',
  },
] as const

const validateReserva = (values: ReservaInterface) => {
  const errors: Partial<Record<keyof ReservaInterface, string>> = {}

  if (!values.nombre.trim()) {
    errors.nombre = messages.requiredName
  }

  if (!values.correo.trim()) {
    errors.correo = messages.requiredEmail
  } else if (!isEmail(values.correo)) {
    errors.correo = messages.invalidEmail
  }

  if (!values.telefono.trim()) {
    errors.telefono = messages.requiredPhone
  } else if (!isPhoneValid(values.telefono)) {
    errors.telefono = messages.invalidPhone
  }

  if (!values.fechaReservacion.trim()) {
    errors.fechaReservacion = messages.requiredDate
  } else {
    const reservationDate = new Date(values.fechaReservacion)
    const now = new Date()

    if (Number.isNaN(reservationDate.getTime()) || reservationDate < now) {
      errors.fechaReservacion = messages.invalidPastDate
    }
  }

  if (!values.MesaidMesa) {
    errors.MesaidMesa = messages.selectMesa
  }

  return errors
}

function getMinDateTimeValue() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function formatReservationDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function buildReservaPayload(values: ReservaInterface): ReservaInterface {
  return {
    ...values,
    estado: false,
    nombre: values.nombre.trim(),
    telefono: values.telefono.trim(),
    correo: values.correo.trim(),
    observacion: values.observacion?.trim() || undefined,
  }
}

export function RegistroPage() {
  const [mesas, setMesas] = useState<MesaInterface[]>([])
  const [reservas, setReservas] = useState<ReservaInterface[]>([])
  const [isLoadingMesas, setIsLoadingMesas] = useState(false)
  const [isLoadingReservas, setIsLoadingReservas] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNoTablesAlert, setShowNoTablesAlert] = useState(false)

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm<ReservaInterface>(
    initialValues,
    validateReserva,
  )

  useEffect(() => {
    let mounted = true

    const loadMesas = async () => {
      setIsLoadingMesas(true)

      try {
        const result = await getAvailableTables(values.fechaReservacion)

        if (!mounted) {
          return
        }

        setMesas(result)
        setShowNoTablesAlert(result.length === 0)
      } catch (error) {
        if (!mounted) {
          return
        }

        setMesas([])
        setShowNoTablesAlert(false)
        await Swal.fire({
          icon: 'error',
          title: 'No pudimos cargar las mesas',
          text: error instanceof Error ? error.message : 'Intenta nuevamente en unos segundos.',
          confirmButtonText: 'Entendido',
        })
      } finally {
        if (mounted) {
          setIsLoadingMesas(false)
        }
      }
    }

    loadMesas()

    return () => {
      mounted = false
    }
  }, [values.fechaReservacion])

  useEffect(() => {
    let mounted = true

    const loadReservas = async () => {
      setIsLoadingReservas(true)

      try {
        const result = await getReservations()

        if (!mounted) {
          return
        }

        setReservas(result)
      } catch (error) {
        if (!mounted) {
          return
        }

        setReservas([])
        await Swal.fire({
          icon: 'error',
          title: 'No pudimos cargar la tabla de reservas',
          text: error instanceof Error ? error.message : 'Intenta nuevamente en unos segundos.',
          confirmButtonText: 'Entendido',
        })
      } finally {
        if (mounted) {
          setIsLoadingReservas(false)
        }
      }
    }

    loadReservas()

    return () => {
      mounted = false
    }
  }, [])

  const onSubmit = async (formValues: ReservaInterface) => {
    setIsSubmitting(true)

    try {
      const response = await createReservation(buildReservaPayload(formValues))
      const reserva = (response?.data ?? response) as ReservaInterface

      setReservas((current) => [reserva, ...current].slice(0, 10))
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

  const mesaOptions = mesas.map((mesa) => ({
    value: mesa.id,
    label: `Mesa ${mesa.id} - capacidad ${mesa.capacidad}`,
  }))

  return (
    <section className="card border-0 shadow-lg reservas-card">
      <div className="card-body p-4 p-lg-5">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-xl-8">
            <div className="mb-4">
              <TituloSeccion>Crear reserva</TituloSeccion>
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
                      value={values[field.id]}
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
                    label="Fecha y hora"
                    type="datetime-local"
                    value={values.fechaReservacion}
                    onChange={handleChange}
                    error={errors.fechaReservacion}
                    min={getMinDateTimeValue()}
                    helpText="Solo se permiten fechas y horas desde el momento actual en adelante."
                    wrapperClassName="col-12 col-md-6"
                  />

                  <CampoSelect
                    id="MesaidMesa"
                    name="MesaidMesa"
                    label="Mesa disponible"
                    value={values.MesaidMesa}
                    onChange={handleChange}
                    options={mesaOptions}
                    error={errors.MesaidMesa}
                    disabled={isLoadingMesas}
                    placeholder={isLoadingMesas ? 'Cargando mesas...' : 'Selecciona una mesa'}
                    wrapperClassName="col-12 col-md-6"
                  />

                  <Campo
                    id="observacion"
                    name="observacion"
                    label="Observacion"
                    value={values.observacion ?? ''}
                    onChange={handleChange}
                    placeholder="Dato adicional para el equipo del restaurante"
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

          <div className="col-12 col-xl-4">
            <aside className="resumen-panel h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 fw-bold mb-0">Ultimas reservas</h3>
                </div>
              </div>

              <div className="table-responsive reservas-table-wrap">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Numero de reserva</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingReservas ? (
                      <tr>
                        <td colSpan={3} className="text-center text-secondary py-4">
                          Cargando reservas...
                        </td>
                      </tr>
                    ) : reservas.length > 0 ? (
                      reservas.map((reserva, index) => (
                        <tr key={`${reserva.numeroReserva ?? index}-${reserva.fechaReservacion}`}>
                          <td className="fw-semibold">{reserva.numeroReserva}</td>
                          <td>{reserva.nombre}</td>
                          <td>{formatReservationDate(reserva.fechaReservacion)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center text-secondary py-4">
                          No hay reservas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
