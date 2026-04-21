import type { ChangeEvent, InputHTMLAttributes } from 'react'

type CampoProps = {
  id: string
  name: string
  label: string
  value: string
  error?: string
  type?: string
  autoComplete?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
} & InputHTMLAttributes<HTMLInputElement>

export function Campo({
  id,
  name,
  label,
  value,
  error,
  type = 'text',
  autoComplete,
  onChange,
  ...props
}: CampoProps) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        {...props}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  )
}
