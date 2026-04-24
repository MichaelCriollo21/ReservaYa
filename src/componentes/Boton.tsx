import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type BotonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary'
  }
>

export function Boton({
  variant = 'primary',
  children,
  className,
  ...props
}: BotonProps) {
  return (
    <button
      className={[
        'btn',
        variant === 'secondary' ? 'btn-outline-secondary' : 'btn-primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
