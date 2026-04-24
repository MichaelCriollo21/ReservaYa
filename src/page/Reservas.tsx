import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Boton } from '../componentes/Boton'
import { Campo, CampoSelect } from '../componentes/Campos'
import { TextoAyuda, TituloSeccion } from '../componentes/Titulos'
import { useForm } from '../hooks/useForm'
import { buildReservaPayload } from '../models/reservaModel'
import { getAvailableTables, createReservation } from '../Tools/api'
import { messages, isEmail, isPhoneValid } from '../Tools/validation'
import type { MesaModel } from '../models/mesas'
import type { ReservationFields, ReservaCreadaPayload } from '../types'

const initialValues: ReservationFields = {
  clienteNombre: '',
  clienteTelefono: '',
  clienteCorreo: '',
  fechaReservacion: '',
  mesaId: '',
  observacion: '',
}

const customerFields = [
  {
    id: 'clienteNombre',
    label: 'Nombre',
    autoComplete: 'name',
    placeholder: 'Nombre completo',
    type: 'text',
  },
  {
    id: 'clienteTelefono',
    label: 'Telefono',
    autoComplete: 'tel',
    placeholder: '3001234567',
    type: 'tel',
  },
  {
    id: 'clienteCorreo',
    label: 'Correo electronico',
    autoComplete: 'email',
    placeholder: 'cliente@correo.com',
    type: 'email',
  },
] as const

const validateReserva = (values: ReservationFields) => {
  const errors: Partial<Record<keyof ReservationFields, string>> = {}

  if (!values.clienteNombre.trim()) {
    errors.clienteNombre = messages.requiredName
  }

  if (!values.clienteCorreo.trim()) {
    errors.clienteCorreo = messages.requiredEmail
  } else if (!isEmail(values.clienteCorreo)) {
    errors.clienteCorreo = messages.invalidEmail
  }

  if (!values.clienteTelefono.trim()) {
    errors.clienteTelefono = messages.requiredPhone
  } else if (!isPhoneValid(values.clienteTelefono)) {
    errors.clienteTelefono = messages.invalidPhone
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

  if (!values.mesaId) {
    errors.mesaId = messages.selectMesa
  }

  return errors
}

function getMinDateTimeValue() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

export function RegistroPage() {
  const [mesas, setMesas] = useState<MesaModel[]>([])
  const [isLoadingMesas, setIsLoadingMesas] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reservaCreada, setReservaCreada] = useState<ReservaCreadaPayload | null>(null)
  const [showNoTablesAlert, setShowNoTablesAlert] = useState(false)

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm<ReservationFields>(
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

  const onSubmit = async (formValues: ReservationFields) => {
    setIsSubmitting(true)

    try {
      const response = await createReservation(buildReservaPayload(formValues))
      const reserva = (response?.data ?? response) as ReservaCreadaPayload

      setReservaCreada(reserva)
      resetForm()

      await Swal.fire({
        icon: 'success',
        title: 'Reserva registrada',
        text: `La reserva ${reserva.NumeroReserva} fue creada correctamente.`,
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
              <TituloSeccion>Completa la reserva</TituloSeccion>
              <TextoAyuda>
                El select de mesas se llena unicamente con la informacion que devuelve la base de datos.
              </TextoAyuda>
            </div>

            {showNoTablesAlert ? (
              <div className="alert alert-warning" role="alert">
                Sin mesas disponibles.
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="row g-3">
                <div className="col-12">
                  <h3 className="h5 fw-semibold text-dark border-bottom pb-2 mb-1">Datos del cliente</h3>
                </div>

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

                <div className="col-12 mt-4">
                  <h3 className="h5 fw-semibold text-dark border-bottom pb-2 mb-1">Detalles de la reserva</h3>
                </div>

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
                  id="mesaId"
                  name="mesaId"
                  label="Mesa disponible"
                  value={values.mesaId}
                  onChange={handleChange}
                  options={mesaOptions}
                  error={errors.mesaId}
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

                <div className="col-12 d-flex flex-column flex-sm-row gap-2 pt-2">
                  <Boton type="submit" className="px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar reserva'}
                  </Boton>
                  <Boton type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting}>
                    Limpiar formulario
                  </Boton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
