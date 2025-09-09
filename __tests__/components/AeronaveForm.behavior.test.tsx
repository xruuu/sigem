// __tests__/components/AeronaveForm.behavior.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import AeronaveForm from '@/components/AeronaveForm' 

describe('AeronaveForm – interacción', () => {
  it('rellena campos y dispara onCreate con payload correcto', async () => {
    const user = userEvent.setup()
    const onCreate = jest.fn()

    render(<AeronaveForm onCreate={onCreate} />)

    await user.type(screen.getByLabelText(/ID/i), 'A1')
    await user.type(screen.getByLabelText(/Nombre/i), 'Ares-1')
    await user.type(screen.getByLabelText(/Máximo pasajeros/i), '3')
    await user.type(screen.getByLabelText(/Nodriza origen/i), 'N1')
    await user.type(screen.getByLabelText(/Nodriza destino/i), 'N2')

    await user.click(screen.getByRole('button', { name: /crear aeronave/i }))

    expect(onCreate).toHaveBeenCalledWith({
      id: 'A1',
      nombre: 'Ares-1',
      maximoMarcianos: 3,
      origenId: 'N1',
      destinoId: 'N2',
    })
  })
})
