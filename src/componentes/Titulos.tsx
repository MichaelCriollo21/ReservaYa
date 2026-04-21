import type { PropsWithChildren } from 'react'

export function TituloSeccion({ children }: PropsWithChildren) {
  return <h2 className="section-title">{children}</h2>
}

export function TextoAyuda({ children }: PropsWithChildren) {
  return <p className="section-copy">{children}</p>
}
