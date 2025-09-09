import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import AeronavesPage from '@/app/aeronaves/page'

const r = (body: any, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }) as any

const flush = () => new Promise(res => setTimeout(res, 0))

describe('AeronavesPage – ramas extra', () => {
  it('POST 201 con input numérico vacío ⇒ backend recibe 0; muestra mensaje y listado vacío', async () => {
    let lastPosted: any = null

    ;(global as any).fetch = jest.fn(async (url: any, init?: any) => {
      const u = String(url)
      const m = (init?.method ?? 'GET').toUpperCase()
      if (u.includes('/api/naves-nodrizas') && m === 'GET') return r([{ id: 'N1', nombre: 'N1' }], 200)
      if (u.includes('/api/aeronaves') && m === 'GET') return r([], 200)
      if (u.includes('/api/aeronaves') && m === 'POST') {
        lastPosted = JSON.parse(init!.body as string)
        return r(lastPosted, 201)
      }
      return r('not-found', 404)
    }) as any

    const { getByPlaceholderText, getByRole, getByText } = render(<AeronavesPage />)
    await flush()

    // id/nombre, numérico vacío
    fireEvent.change(getByPlaceholderText(/identificador/i), { target: { value: 'A-Empty' } })
    fireEvent.change(getByPlaceholderText(/nombre/i), { target: { value: 'Vacio' } })
    fireEvent.change(getByPlaceholderText(/máximo de pasajeros/i), { target: { value: '' } })

    // Botón "Crear"
    fireEvent.click(getByRole('button', { name: /^crear$/i }))
    await flush()

    // La página coacciona vacío a 0 ⇒ esperamos 0
    expect(lastPosted.maximoMarcianos).toBe(0)

    // éxito + tabla vacía
    expect(getByText(/Aeronave creada/i)).toBeTruthy()
    expect(getByText(/No hay aeronaves/i)).toBeInTheDocument()
  })
})
