import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '@/components/Field'

describe('Field component', () => {
  it('muestra label y asocia el control anidado', async () => {
    const user = userEvent.setup()

    render(
      <Field label="Capacidad">
        <input type="number" placeholder="Capacidad máxima" />
      </Field>
    )

    // hay label visible:
    expect(screen.getByText(/Capacidad/i)).toBeInTheDocument()

    // el input existe y es escribible:
    const input = screen.getByPlaceholderText(/Capacidad máxima/i) as HTMLInputElement
    await user.type(input, '42')
    expect(input.value).toBe('42')
  })
})
