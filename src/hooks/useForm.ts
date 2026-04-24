import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { FormErrors, FormValues } from '../Interfaces/types'

type ValidateFn<T> = (values: FormValues<T>) => FormErrors<T>

type UseFormReturn<T> = {
  values: FormValues<T>
  errors: FormErrors<T>
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  handleSubmit: (
    onSubmit: (values: FormValues<T>) => void,
  ) => (event: FormEvent<HTMLFormElement>) => void
  resetForm: () => void
}

export function useForm<T>(
  initialValues: FormValues<T>,
  validate: ValidateFn<T>,
): UseFormReturn<T> {
  const [values, setValues] = useState<FormValues<T>>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target as HTMLInputElement & HTMLSelectElement
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit =
    (onSubmit: (values: FormValues<T>) => void) =>
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const validationErrors = validate(values)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length === 0) {
        onSubmit(values)
      }
    }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, handleChange, handleSubmit, resetForm }
}
