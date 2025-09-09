/** @jest-environment jsdom */
import React from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react'
import RevisionesPage from '@/app/revisiones/page'

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

describe('Página Revisiones – comportamiento adicional', () => {
  const originalFetch = global.fetch as any

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    global.fetch = jest.fn(async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input?.toString?.() ?? ''
      const method = (init?.method || 'GET').toUpperCase()

      if (url.includes('/api/revisiones') && method === 'GET') {
        return makeRes([])
      }

      if (url.includes('/api/aeronaves') && method === 'GET') {
        return makeRes([{ id: 'A1', nombre: 'Arcadia', maximoMarcianos: 2, origenId: 'N1', destinoId: 'N1' }])
      }

      if (url.includes('/api/revisiones') && method === 'POST') {
        const body = JSON.parse(init?.body ?? '{}')
        if (!body?.nombreRevisor || !body?.aeronaveId) {
          return makeRes({ error: 'validación' }, 422)
        }
        return makeRes(body, 201)
      }

      return makeRes('not found', 404, { 'content-type': 'text/plain' })
    }) as any
  })

  afterEach(() => { global.fetch = originalFetch })

  it('carga listas iniciales y permite crear una revisión válida', async () => {
    const { container } = render(<RevisionesPage />)

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls
      // no exigimos 2º argumento
      expect(calls.some(([u]) => typeof u === 'string' && u.includes('/api/revisiones'))).toBe(true)
      expect(calls.some(([u]) => typeof u === 'string' && u.includes('/api/aeronaves'))).toBe(true)
    })

    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[]
    const nombreInput = inputs.find(i => /revisor/i.test(i.name || '')) ?? inputs[1] ?? inputs[0]
    const idInput = inputs.find(i => /id/i.test(i.name || '')) ?? inputs[0]
    const select = container.querySelector('select') as HTMLSelectElement | null

    await act(async () => {
      if (idInput) fireEvent.change(idInput, { target: { value: 'R-1' } })
      fireEvent.change(nombreInput, { target: { value: 'Trillian' } })
      if (select) fireEvent.change(select, { target: { value: 'A1' } })
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })

    // Verificamos POST a /api/revisiones (sin exigir options)
    const calls = (global.fetch as jest.Mock).mock.calls
    expect(calls.some(([u, init]) =>
      typeof u === 'string' && u.includes('/api/revisiones') && ((init?.method || 'GET') === 'POST')
    )).toBe(true)
  })

  it('camino 422 mantiene valores introducidos en el formulario', async () => {
    const { container } = render(<RevisionesPage />)
    await waitFor(() => (global.fetch as jest.Mock).mock.calls.length > 0)

    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[]
    const nombreInput = inputs.find(i => /revisor/i.test(i.name || '')) ?? inputs[0]

    await act(async () => {
      fireEvent.change(nombreInput, { target: { value: 'ConError' } })
      // No seteamos aeronaveId para forzar 422
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })

    const calls = (global.fetch as jest.Mock).mock.calls
    expect(calls.some(([u, init]) =>
      typeof u === 'string' && u.includes('/api/revisiones') && ((init?.method || 'GET') === 'POST')
    )).toBe(true)

    expect(nombreInput.value).toBe('ConError')
  })
})
