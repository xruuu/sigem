import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '@/components/Field'

describe('Field – comportamiento básico', () => {
  it('renderiza label y asocia el control hijo', async () => {
    const user = userEvent.setup()
    render(
      <Field label="Identificador">
        <input aria-label="Identificador" placeholder="ID..." />
      </Field>
    )
    const input = screen.getByLabelText(/Identificador/i) as HTMLInputElement
    expect(screen.getByText(/Identificador/i)).toBeInTheDocument()
    await user.type(input, 'N1')
    expect(input.value).toBe('N1')
  })
})
