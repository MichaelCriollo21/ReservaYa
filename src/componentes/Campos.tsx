import type { ChangeEvent, InputHTMLAttributes, SelectHTMLAttributes } from 'react'

type BaseCampoProps = {
  id: string
  name: string
  label: string
  value: string
  error?: string
  helpText?: string
  wrapperClassName?: string
  labelClassName?: string
}

type CampoProps = BaseCampoProps & {
  type?: string
  autoComplete?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
} & InputHTMLAttributes<HTMLInputElement>

type CampoSelectProps = BaseCampoProps & {
  options: Array<{
    label: string
    value: string
  }>
  placeholder?: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
} & SelectHTMLAttributes<HTMLSelectElement>

export function Campo({
  id,
  name,
  label,
  value,
  error,
  helpText,
  type = 'text',
  autoComplete,
  onChange,
  wrapperClassName,
  labelClassName = 'form-label fw-semibold',
  className,
  ...props
}: CampoProps) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={['form-control', error ? 'is-invalid' : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {error ? <div className="invalid-feedback">{error}</div> : null}
      {!error && helpText ? <div className="form-text">{helpText}</div> : null}
    </div>
  )
}

export function CampoSelect({
  id,
  name,
  label,
  value,
  error,
  helpText,
  options,
  placeholder = 'Selecciona una opcion',
  onChange,
  wrapperClassName,
  labelClassName = 'form-label fw-semibold',
  className,
  ...props
}: CampoSelectProps) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={['form-select', error ? 'is-invalid' : '', className].filter(Boolean).join(' ')}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <div className="invalid-feedback">{error}</div> : null}
      {!error && helpText ? <div className="form-text">{helpText}</div> : null}
    </div>
  )
}
