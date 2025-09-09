/** @jest-environment jsdom */
import React from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react'
import AeronavesPage from '@/app/aeronaves/page'

const flush = () => new Promise(res => setTimeout(res, 0))

// Polyfill ligero de Response para mocks de fetch
const makeRes = (
  body: any,
  status = 200,
  headers: Record<string, string> = { 'content-type': 'application/json' }
) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: {
    get: (k: string) => headers[k.toLowerCase()] || headers[k] || null
  },
  json: async () => body,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
})

describe('Página Aeronaves – comportamiento adicional', () => {
  const originalFetch = global.fetch as any

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    global.fetch = jest.fn(async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input?.toString?.() ?? ''
      const method = (init?.method || 'GET').toUpperCase()

      // Carga inicial
      if (url.includes('/api/naves-nodrizas') && method === 'GET') {
        return makeRes([{ id: 'N1', nombre: 'N1' }])
      }
      if (url.includes('/api/aeronaves') && method === 'GET') {
        return makeRes([])
      }

      // Creación
      if (url.includes('/api/aeronaves') && method === 'POST') {
        const body = JSON.parse(init?.body ?? '{}')
        if (!body?.id || !body?.nombre || typeof body?.maximoMarcianos !== 'number') {
          return makeRes({ error: 'validación' }, 422)
        }
        return makeRes(
          { id: body.id, nombre: body.nombre, maximoMarcianos: body.maximoMarcianos, origenId: 'N1', destinoId: 'N1' },
          201
        )
      }

      return makeRes('not found', 404, { 'content-type': 'text/plain' })
    }) as any
  })

  afterEach(() => { global.fetch = originalFetch })

  it('carga inicial: pide nodrizas y aeronaves', async () => {
    render(<AeronavesPage />)
    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls
      expect(calls.some(([u]) => typeof u === 'string' && u.includes('/api/naves-nodrizas'))).toBe(true)
      expect(calls.some(([u]) => typeof u === 'string' && u.includes('/api/aeronaves'))).toBe(true)
    })
  })

  it('camino de error en POST (422) no rompe y permite reintentar con éxito', async () => {
    const { container } = render(<AeronavesPage />)
    await waitFor(() => (global.fetch as jest.Mock).mock.calls.length > 0)

    // Detecta inputs (id, nombre, maximoMarcianos)
    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[]
    const numberInput = inputs.find(i => i.type === 'number') ?? inputs[2]
    const textInputs = inputs.filter(i => i.type !== 'number')
    const idInput = textInputs[0]
    const nombreInput = textInputs[1] ?? textInputs[0]

    // 1) Primer intento inválido (fuerza 422)
    await act(async () => {
      fireEvent.change(idInput, { target: { value: 'A-1' } })
      fireEvent.change(nombreInput, { target: { value: 'Nave Uno' } })
      // maximoMarcianos vacío => typeof !== 'number'
      fireEvent.change(numberInput, { target: { value: '' } })
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })

    // Se realizó al menos un POST
    const post1Count = (global.fetch as jest.Mock).mock.calls.filter(
      ([u, init]) => typeof u === 'string' && u.includes('/api/aeronaves') && ((init?.method || 'GET') === 'POST')
    ).length
    expect(post1Count).toBeGreaterThanOrEqual(1)

    // 2) Reintento válido: ponemos un número y enviamos de nuevo
    await act(async () => {
      // si el formulario se reseteó, reescribimos id/nombre; si no, los deja tal cual
      if (!idInput.value) fireEvent.change(idInput, { target: { value: 'A-1' } })
      if (!nombreInput.value) fireEvent.change(nombreInput, { target: { value: 'Nave Uno' } })
      fireEvent.change(numberInput, { target: { value: '5' } })
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })

    const post2Count = (global.fetch as jest.Mock).mock.calls.filter(
      ([u, init]) => typeof u === 'string' && u.includes('/api/aeronaves') && ((init?.method || 'GET') === 'POST')
    ).length
    expect(post2Count).toBeGreaterThanOrEqual(2)
  })
})
