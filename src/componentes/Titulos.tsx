import type { HTMLAttributes, PropsWithChildren } from 'react'

type TituloProps = PropsWithChildren<{
  className?: string
}>

type TextoProps = PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>

export function TituloSeccion({ children, className }: TituloProps) {
  return <h2 className={['h3 fw-bold text-dark mb-2', className].filter(Boolean).join(' ')}>{children}</h2>
}

export function TextoAyuda({ children, className, ...props }: TextoProps) {
  return (
    <p className={['text-secondary mb-0', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  )
}
