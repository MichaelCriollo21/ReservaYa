type ValidationErrors<T> = Partial<Record<keyof T, string>>

export type FormValues<T> = T

export type FormErrors<T> = ValidationErrors<T>
