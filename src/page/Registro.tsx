import { useState } from 'react'
import { useForm } from '../hooks/useForm'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campos'
import { TituloSeccion, TextoAyuda } from '../componentes/Titulos'
import type {
  ReservationFields,
  ClientePayload,
  ReservaPayload,
} from '../types'
import { messages, isEmail, isPhoneValid } from '../Tools/validation'
import { horarios as horariosModel } from '../models/horarios'
import { mesas as mesasModel } from '../models/mesas'
import { buildClientePayload } from '../models/clienteModel'
import { buildReservaPayload } from '../models/reservaModel'

const initialValues: ReservationFields = {
  clienteNombre: '',
  clienteTelefono: '',
  clienteCorreo: '',
  fechaReservacion: '',
  horarioId: '',
  mesaId: '',
  observacion: '',
}

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
  }

  if (!values.horarioId) {
    errors.horarioId = messages.selectHorario
  }

  if (!values.mesaId) {
    errors.mesaId = messages.selectMesa
  }

  return errors
}

export function RegistroPage() {
  const [payloadPreview, setPayloadPreview] = useState<
    { cliente: ClientePayload; reserva: ReservaPayload } | null
  >(null)

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm<
    ReservationFields
  >(initialValues, validateReserva)

  // importar modelos con datos de ejemplo (pueden reemplazarse por fetch)
  const horarios = horariosModel
  const mesas = mesasModel

  const onSubmit = (formValues: ReservationFields) => {
    const cliente = buildClientePayload(formValues)
    const reserva = buildReservaPayload(formValues)

    const payload = { cliente, reserva }

    // Preparar hook para enviar al backend (por ahora solo preview)
    console.log('Payload reserva (listo para enviar):', payload)
    setPayloadPreview(payload)
    resetForm()
  }

  return (
    <section>
      <TituloSeccion>Registro de reserva</TituloSeccion>
      <TextoAyuda>Completa los datos del cliente y la reserva.</TextoAyuda>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h3>Datos del cliente</h3>
        <Campo
          id="clienteNombre"
          name="clienteNombre"
          label="Nombre"
          value={values.clienteNombre}
          onChange={handleChange}
          autoComplete="name"
          error={errors.clienteNombre}
        />

        <Campo
          id="clienteCorreo"
          name="clienteCorreo"
          label="Correo"
          value={values.clienteCorreo}
          onChange={handleChange}
          type="email"
          autoComplete="email"
          error={errors.clienteCorreo}
        />

        <Campo
          id="clienteTelefono"
          name="clienteTelefono"
          label="Teléfono"
          value={values.clienteTelefono}
          onChange={handleChange}
          type="tel"
          autoComplete="tel"
          error={errors.clienteTelefono}
        />

        <h3>Detalles de la reserva</h3>

        <div className="field-group">
          <label htmlFor="fechaReservacion">Fecha y hora</label>
          <input
            id="fechaReservacion"
            name="fechaReservacion"
            type="datetime-local"
            value={values.fechaReservacion}
            onChange={handleChange}
          />
          {errors.fechaReservacion ? (
            <span className="field-error">{errors.fechaReservacion}</span>
          ) : null}
        </div>

        <div className="field-group">
          <label htmlFor="horarioId">Horario</label>
          <select
            id="horarioId"
            name="horarioId"
            value={values.horarioId}
            onChange={handleChange}
          >
            <option value="">-- Selecciona --</option>
            {horarios.map((h) => (
              <option key={h.id} value={h.id}>
                {h.bloque} — {h.hora}
              </option>
            ))}
          </select>
          {errors.horarioId ? (
            <span className="field-error">{errors.horarioId}</span>
          ) : null}
        </div>

        <div className="field-group">
          <label htmlFor="mesaId">Mesa</label>
          <select id="mesaId" name="mesaId" value={values.mesaId} onChange={handleChange}>
            <option value="">-- Selecciona --</option>
            {mesas.map((m) => (
              <option key={m.id} value={m.id}>
                Mesa {m.id} — capacidad {m.capacidad}
              </option>
            ))}
          </select>
          {errors.mesaId ? <span className="field-error">{errors.mesaId}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="observacion">Observación (opcional)</label>
          <input
            id="observacion"
            name="observacion"
            value={values.observacion}
            onChange={handleChange}
          />
        </div>

        <div className="actions-row">
          <Boton type="submit">Registrar reserva</Boton>
          <Boton type="button" variant="secondary" onClick={resetForm}>
            Limpiar
          </Boton>
        </div>
      </form>

      {payloadPreview ? (
        <div className="registration-summary">
          <h3>Reserva preparadа</h3>
          <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {JSON.stringify(payloadPreview, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  )
}
