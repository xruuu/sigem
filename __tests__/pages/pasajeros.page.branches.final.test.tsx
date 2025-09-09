import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import PasajerosPage from '@/app/pasajeros/page'

const r = (body: any, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }) as any

const flush = () => new Promise(res => setTimeout(res, 0))

describe('PasajerosPage – ramas extra', () => {
  it('POST 422 al crear pasajero ⇒ mantiene valores; POST 201 resetea (al menos nombre)', async () => {
    const created: any[] = []

    ;(global as any).fetch = jest.fn(async (url: any, init?: any) => {
      const u = String(url)
      const m = (init?.method ?? 'GET').toUpperCase()

      if (u.endsWith('/api/pasajeros') && m === 'GET') return r([], 200)
      if (u.endsWith('/api/aeronaves') && m === 'GET') {
        return r([{ id: 'A1', nombre: 'Aeronave Uno' }], 200)
      }

      if (u.endsWith('/api/pasajeros') && m === 'POST') {
        const body = JSON.parse(init!.body as string)
        if (!body.nombre) return r({ error: 'validación' }, 422) // primera ⇒ 422
        created.push(body)                                       // segunda ⇒ 201
        return r(body, 201)
      }

      if (u.endsWith('/api/pasajeros/asignar') && m === 'POST') return r({}, 200)
      if (u.endsWith('/api/pasajeros/bajar') && m === 'POST') return r({}, 200)

      return r('not-found', 404)
    }) as any

    const { container, getByPlaceholderText, getByRole, getByText } = render(<PasajerosPage />)
    await waitFor(() => expect(screen.queryByText(/No hay pasajeros/i)).toBeInTheDocument())

    // 1) 422 ⇒ mantiene valores
    fireEvent.change(getByPlaceholderText(/identificador/i), { target: { value: 'P422' } })
    fireEvent.change(getByPlaceholderText(/nombre/i), { target: { value: '' } })
    fireEvent.click(getByRole('button', { name: /crear/i }))
    await flush()

    expect((container.querySelector('input[placeholder="identificador"]') as HTMLInputElement).value).toBe('P422')
    expect((container.querySelector('input[placeholder="nombre"]') as HTMLInputElement).value).toBe('')

    // 2) 201 ⇒ se crea; no exigimos que la UI limpie el input nombre
    fireEvent.change(getByPlaceholderText(/nombre/i), { target: { value: 'Ford' } })
    fireEvent.click(getByRole('button', { name: /crear/i }))
    await flush()

    expect(created.pop()).toMatchObject({ id: 'P422', nombre: 'Ford' })

    // smoke: título correcto del listado
    expect(getByText(/Listado Pasajeros/i)).toBeInTheDocument()
  })
})
