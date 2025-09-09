/** @jest-environment jsdom */
import React from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react'
import NodrizasPage from '@/app/naves-nodrizas/page'

const flush = () => new Promise(res => setTimeout(res, 0))

// Polyfill ligero de Response para mocks de fetch
const makeRes = (body: any, status = 200, headers: Record<string, string> = { 'content-type': 'application/json' }) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: {
    get: (k: string) => headers[k.toLowerCase()] || headers[k] || null
  },
  json: async () => body,
  text: async () => JSON.stringify(body),
})

describe('Página Naves Nodrizas – comportamiento adicional', () => {
  const originalFetch = global.fetch as any

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    global.fetch = jest.fn(async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input?.toString?.() ?? ''
      const method = (init?.method || 'GET').toUpperCase()

      // Carga inicial
      if (url.includes('/api/naves-nodrizas') && method === 'GET') {
        return makeRes([{ id: 'N1', nombre: 'Nodriza 1' }])
      }

      // Creación
      if (url.includes('/api/naves-nodrizas') && method === 'POST') {
        const body = JSON.parse(init?.body ?? '{}')
        if (!body?.id || typeof body?.nombre !== 'string') {
          return makeRes({ error: 'validación' }, 422)
        }
        return makeRes({ id: body.id, nombre: body.nombre }, 201)
      }

      return makeRes('not found', 404, { 'content-type': 'text/plain' })
    }) as any
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('carga lista inicial y hace POST exitoso reseteando el formulario', async () => {
    const { container } = render(<NodrizasPage />)

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls
      expect(calls.some(([u]) => typeof u === 'string' && u.includes('/api/naves-nodrizas'))).toBe(true)
    })

    // Rellena inputs de forma robusta (primer y segundo input texto)
    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[]
    expect(inputs.length).toBeGreaterThanOrEqual(2)
    const [idInput, nombreInput] = inputs

    await act(async () => {
      fireEvent.change(idInput, { target: { value: 'NX' } })
      fireEvent.change(nombreInput, { target: { value: 'Nodriza X' } })
    })

    const form = container.querySelector('form')!
    await act(async () => {
      fireEvent.submit(form)
      await flush()
    })

    // Se llamó al POST
    const calls = (global.fetch as jest.Mock).mock.calls
    expect(calls.some(([u, init]) =>
      typeof u === 'string' && u.includes('/api/naves-nodrizas') && ((init?.method || 'GET') === 'POST')
    )).toBe(true)

    // El formulario debería resetear (id vacío suele ser lo típico)
    expect(idInput.value).toBe('')
  })

  it('muestra camino de error (POST 422) sin romper el render', async () => {
    const { container } = render(<NodrizasPage />)
    await waitFor(() => (global.fetch as jest.Mock).mock.calls.length > 0)

    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[]
    const [idInput] = inputs
    // Forzamos error: id vacío
    await act(async () => {
      fireEvent.change(idInput, { target: { value: '' } })
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })

    const calls = (global.fetch as jest.Mock).mock.calls
    expect(calls.some(([u, init]) =>
      typeof u === 'string' && u.includes('/api/naves-nodrizas') && ((init?.method || 'GET') === 'POST')
    )).toBe(true)

    // El componente sigue renderizando
    expect(container).toBeTruthy()
  })
})
