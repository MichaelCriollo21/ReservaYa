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
        'boton',
        variant === 'secondary' ? 'boton-secondary' : 'boton-primary',
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
