/** @jest-environment jsdom */
import React from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react'
import PasajerosPage from '@/app/pasajeros/page'

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

describe('Página Pasajeros – comportamiento adicional', () => {
  const originalFetch = global.fetch as any

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    global.fetch = jest.fn(async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input?.toString?.() ?? ''
      const method = (init?.method || 'GET').toUpperCase()

      // Carga inicial
      if (url.includes('/api/pasajeros') && method === 'GET') {
        return makeRes([{ id: 'P1', nombre: 'Marvin' }])
      }
      if (url.includes('/api/aeronaves') && method === 'GET') {
        return makeRes([{ id: 'A1', nombre: 'Arcadia', maximoMarcianos: 2, origenId: 'N1', destinoId: 'N1' }])
      }

      // Alta pasajero
      if (url.includes('/api/pasajeros') && method === 'POST') {
        const body = JSON.parse(init?.body ?? '{}')
        if (!body?.id || typeof body?.nombre !== 'string') {
          return makeRes({ error: 'validación' }, 422)
        }
        return makeRes({ id: body.id, nombre: body.nombre }, 201)
      }

      // Acciones asignar/bajar
      if (url.includes('/api/pasajeros/asignar') && method === 'POST') {
        return makeRes({ ok: true }, 201)
      }
      if (url.includes('/api/pasajeros/bajar') && method === 'POST') {
        return makeRes({ ok: true }, 201)
      }

      return makeRes('not found', 404, { 'content-type': 'text/plain' })
    }) as any
  })

  afterEach(() => { global.fetch = originalFetch })

  it('carga listas y permite crear un pasajero', async () => {
    const { container } = render(<PasajerosPage />)

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls
      expect(calls.some(([u]) => typeof u === 'string' && u.includes('/api/pasajeros'))).toBe(true)
      expect(calls.some(([u]) => typeof u === 'string' && u.includes('/api/aeronaves'))).toBe(true)
    })

    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[]
    expect(inputs.length).toBeGreaterThanOrEqual(2)
    const [idInput, nombreInput] = inputs

    await act(async () => {
      fireEvent.change(idInput, { target: { value: 'P2' } })
      fireEvent.change(nombreInput, { target: { value: 'Ford Prefect' } })
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })

    // Se llamó al POST de creación
    const calls = (global.fetch as jest.Mock).mock.calls
    expect(calls.some(([u, init]) =>
      typeof u === 'string' && u.includes('/api/pasajeros') && ((init?.method || 'GET') === 'POST')
    )).toBe(true)
  })

  it('asigna y baja pasajero mediante las acciones correspondientes (si existen)', async () => {
    const { container } = render(<PasajerosPage />)
    await waitFor(() => (global.fetch as jest.Mock).mock.calls.length > 0)

    // Formulario "Asignar Pasajero" (buscamos el segundo form del DOM)
    const forms = Array.from(container.querySelectorAll('form'))
    const asignarForm = forms[1]
    const asignarSelects = Array.from(asignarForm.querySelectorAll('select')) as HTMLSelectElement[]
    const [selPasajero, selAeronave] = asignarSelects

    await act(async () => {
      if (selPasajero) fireEvent.change(selPasajero, { target: { value: 'P1' } })
      if (selAeronave) fireEvent.change(selAeronave, { target: { value: 'A1' } })
      fireEvent.submit(asignarForm)
      await flush()
    })

    // Formulario "Bajar Pasajero" (tercer form del DOM)
    const bajarForm = forms[2]
    const bajarSelects = Array.from(bajarForm.querySelectorAll('select')) as HTMLSelectElement[]
    const [selPasajeroB, selAeronaveB] = bajarSelects

    await act(async () => {
      if (selPasajeroB) fireEvent.change(selPasajeroB, { target: { value: 'P1' } })
      if (selAeronaveB) fireEvent.change(selAeronaveB, { target: { value: 'A1' } })
      fireEvent.submit(bajarForm)
      await flush()
    })

    const calls = (global.fetch as jest.Mock).mock.calls
    expect(calls.some(([u, init]) =>
      typeof u === 'string' && u.includes('/api/pasajeros/asignar') && ((init?.method || 'GET') === 'POST')
    )).toBe(true)
    expect(calls.some(([u, init]) =>
      typeof u === 'string' && u.includes('/api/pasajeros/bajar') && ((init?.method || 'GET') === 'POST')
    )).toBe(true)
  })
})
