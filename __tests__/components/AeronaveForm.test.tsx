import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '@/components/Field'

describe('Field component', () => {
  it('renderiza label y permite escribir', async () => {
    const user = userEvent.setup()

    render(
      <Field label="Nombre">
        <input placeholder="Nombre de la aeronave" />
      </Field>
    )

    const input = screen.getByPlaceholderText(/Nombre de la aeronave/i) as HTMLInputElement
    // el label existe:
    expect(screen.getByText(/Nombre/i)).toBeInTheDocument()

    await user.type(input, 'Ares-1')
    expect(input.value).toBe('Ares-1')
  })
})
