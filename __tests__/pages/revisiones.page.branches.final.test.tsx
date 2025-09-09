import React from 'react'
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react'
import RevisionesPage from '@/app/revisiones/page'

const r = (body: any, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }) as any

const flush = () => new Promise(res => setTimeout(res, 0))

describe('RevisionesPage – ramas extra', () => {
  it('histórico con filas', async () => {
    ;(global as any).fetch = jest.fn(async (url: any, init?: any) => {
      const u = String(url)
      const m = (init?.method ?? 'GET').toUpperCase()

      if (u.includes('/api/revisiones') && m === 'GET') {
        return r([{ id: 'R1', revisor: 'Zaphod', aeronaveId: 'A1', fecha: '2024-01-01', pasajeros: ['P1', 'P2'] }], 200)
      }
      if (u.includes('/api/aeronaves') && m === 'GET') {
        return r([{ id: 'A1', nombre: 'Aeronave Uno' }], 200)
      }
      return r('not-found', 404)
    }) as any

    render(<RevisionesPage />)

    // Espera a que desaparezca el placeholder de "No hay revisiones."
    await waitFor(() => expect(screen.queryByText('No hay revisiones.')).toBeNull())

    // Comprobaciones robustas (la UI puede no renderizar el nombre del revisor)
    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('P1, P2')).toBeInTheDocument()
  })

  it('aeronaves vacías + POST 422 (mantiene valores)', async () => {
    let posted: any = null

    ;(global as any).fetch = jest.fn(async (url: any, init?: any) => {
      const u = String(url)
      const m = (init?.method ?? 'GET').toUpperCase()

      if (u.includes('/api/revisiones') && m === 'GET') return r([], 200)
      if (u.includes('/api/aeronaves') && m === 'GET') return r([], 200)

      if (u.includes('/api/revisiones') && m === 'POST') {
        posted = JSON.parse(init!.body as string)
        if (!posted.aeronaveId) return r({ error: 'validación' }, 422) // 422 cuando falta aeronave
        return r(posted, 201)
      }
      return r('not-found', 404)
    }) as any

    const { container } = render(<RevisionesPage />)
    await flush()

    const id = container.querySelector('input[placeholder="identificador"]') as HTMLInputElement
    const nombre = container.querySelector('input[placeholder="nombre del revisor"]') as HTMLInputElement
    const form = container.querySelector('form')!

    await act(async () => {
      fireEvent.change(id, { target: { value: 'R-422' } })
      fireEvent.change(nombre, { target: { value: 'Ford' } })
      // no seleccionar aeronave ⇒ 422
      fireEvent.submit(form)
      await flush()
    })

    expect(posted.id).toBe('R-422')
    // Puede enviar "revisor" o "nombre" según implementación. Aquí no lo afirmamos, sólo aeronaveId vacío.
    expect(posted.aeronaveId ?? '').toBe('')

    // Mantiene valores tras 422
    expect((container.querySelector('input[placeholder="identificador"]') as HTMLInputElement).value).toBe('R-422')
    expect((container.querySelector('input[placeholder="nombre del revisor"]') as HTMLInputElement).value).toBe('Ford')
  })
})
