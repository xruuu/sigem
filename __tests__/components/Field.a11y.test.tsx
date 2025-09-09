// __tests__/components/Field.a11y.test.tsx
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Field } from '@/components/Field'

describe('Field – accesibilidad', () => {
  it('asocia label al input por id y aria', () => {
    render(
      <Field label="Nombre">
        <input id="nombre" aria-label="Nombre" placeholder="Nombre de la aeronave" />
      </Field>
    )

    const input = screen.getByPlaceholderText(/Nombre de la aeronave/i)
    const label = screen.getByLabelText(/Nombre/i)
    expect(label).toBeInTheDocument()
    expect((input as HTMLInputElement).id).toBe('nombre')
  })
})
