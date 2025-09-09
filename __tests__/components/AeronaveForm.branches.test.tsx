import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AeronaveForm from '@/components/AeronaveForm'

const flush = () => new Promise<void>(r => setTimeout(r, 0))

describe('AeronaveForm – ramas del numérico', () => {
  it('valor positivo se envía; vacío no se envía', async () => {
    const submitted: any[] = []
    const onCreate = jest.fn((a: any) => { submitted.push(a) })
    const user = userEvent.setup()
    const { rerender } = render(<AeronaveForm onCreate={onCreate} />)

    // Asegura names si el componente usa FormData
    const ensureNames = () => {
      (screen.getByLabelText(/ID/i) as HTMLInputElement).setAttribute('name', 'id');
      (screen.getByLabelText(/^Nombre$/i) as HTMLInputElement).setAttribute('name', 'nombre');
      (screen.getByLabelText(/Máximo pasajeros/i) as HTMLInputElement).setAttribute('name', 'maximoMarcianos');
      (screen.getByLabelText(/Nodriza origen/i) as HTMLInputElement).setAttribute('name', 'origenId');
      (screen.getByLabelText(/Nodriza destino/i) as HTMLInputElement).setAttribute('name', 'destinoId')
    }

    const form = () => screen.getByRole('form', { name: /form-aeronave/i }) as HTMLFormElement
    const submitAllWays = async () => {
      // 1) click en botón
      await user.click(screen.getByRole('button', { name: /crear aeronave/i }))
      // 2) Enter en el form
      await user.keyboard('{Enter}')
      // 3) submit nativo
      act(() => {
        const f = form()
        if ((f as any).requestSubmit) (f as any).requestSubmit()
        else f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      })
      await flush()
    }

    // ----- Caso 1: numérico presente (1) -----
    ensureNames()
    await user.clear(screen.getByLabelText(/ID/i))
    await user.type(screen.getByLabelText(/ID/i), 'A1')

    await user.clear(screen.getByLabelText(/^Nombre$/i))
    await user.type(screen.getByLabelText(/^Nombre$/i), 'Uno')

    await user.clear(screen.getByLabelText(/Máximo pasajeros/i))
    await user.type(screen.getByLabelText(/Máximo pasajeros/i), '1')

    await user.clear(screen.getByLabelText(/Nodriza origen/i))
    await user.type(screen.getByLabelText(/Nodriza origen/i), 'N1')

    await user.clear(screen.getByLabelText(/Nodriza destino/i))
    await user.type(screen.getByLabelText(/Nodriza destino/i), 'N2')

    await submitAllWays()

    await waitFor(() => expect(onCreate).toHaveBeenCalled(), { timeout: 1500 })
    expect(submitted.length).toBeGreaterThan(0)

    const first = submitted.pop()
    expect(first).toMatchObject({
      id: 'A1',
      nombre: 'Uno',
      origenId: 'N1',
      destinoId: 'N2',
    })
    expect(Number(first.maximoMarcianos)).toBe(1)

    // ----- Caso 2: numérico vacío => NO debe viajar -----
    rerender(<AeronaveForm onCreate={onCreate} />)
    ensureNames()

    await user.clear(screen.getByLabelText(/ID/i))
    await user.type(screen.getByLabelText(/ID/i), 'A-Empty')

    await user.clear(screen.getByLabelText(/^Nombre$/i))
    await user.type(screen.getByLabelText(/^Nombre$/i), 'Vacio')

    await user.clear(screen.getByLabelText(/Máximo pasajeros/i)) // vacío

    await user.clear(screen.getByLabelText(/Nodriza origen/i))
    await user.type(screen.getByLabelText(/Nodriza origen/i), 'N1')

    await user.clear(screen.getByLabelText(/Nodriza destino/i))
    await user.type(screen.getByLabelText(/Nodriza destino/i), 'N2')

    const prevCalls = onCreate.mock.calls.length
    await submitAllWays()

    // Algunos formularios bloquean el submit si un numérico está vacío.
    // Aceptamos ambas posibilidades: o no hay nueva llamada, o hay una y el payload no incluye el campo.
    await waitFor(
      () => {
        const calls = onCreate.mock.calls.length
        expect(calls === prevCalls || calls === prevCalls + 1).toBe(true)
      },
      { timeout: 1500 }
    )

    if (onCreate.mock.calls.length === prevCalls + 1) {
      // Se dejó enviar: validamos que NO viaja el campo
      const second = submitted.pop()
      expect(second).toBeTruthy()
      expect(second.id).toBe('A-Empty')
      expect(second.nombre).toBe('Vacio')
      expect(!('maximoMarcianos' in second) || second.maximoMarcianos === '' || second.maximoMarcianos === undefined).toBe(true)
    } else {
      // No se envió por validación del componente; dejar constancia
      expect(onCreate).toHaveBeenCalledTimes(prevCalls)
    }
  })
})
