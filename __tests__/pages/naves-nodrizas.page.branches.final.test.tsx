import React from 'react'
import { render, screen, act } from '@testing-library/react'
import NavesNodrizasPage from '@/app/naves-nodrizas/page'

function mockFetch(routes: Record<string, any>) {
  const fn = jest.fn(async (input: any, init?: any) => {
    const raw = typeof input === 'string' ? input : input.url
    const method = (init?.method ?? 'GET').toUpperCase()
    const path = raw.includes('://') ? new URL(raw).pathname : raw
    const key = `${method} ${path}`
    const cfg = routes[key]
    if (!cfg) return { ok: false, status: 404, json: async () => ({ error: 'not-found' }) } as any
    // si es array/obj sin 'ok', devolvemos 200 con ese json
    if (Array.isArray(cfg) || (cfg && typeof cfg === 'object' && !('ok' in cfg))) {
      return { ok: true, status: 200, json: async () => cfg } as any
    }
    const { ok = true, status = ok ? 200 : 500, json } = cfg as any
    return { ok, status, json: async () => json } as any
  })
  global.fetch = fn as any
  return fn
}

async function flush() { await act(async () => { await Promise.resolve() }) }

describe('NavesNodrizasPage – ramas', () => {
  it('lista elementos cuando GET devuelve datos', async () => {
    mockFetch({ 'GET /api/naves-nodrizas': [{ id: 'N1' }, { id: 'N2' }] })

    render(<NavesNodrizasPage />)
    await flush()

    // Usamos regex (match parcial) porque el <li> contiene “N1 —”
    expect(screen.getByText(/N1/)).toBeInTheDocument()
    expect(screen.getByText(/N2/)).toBeInTheDocument()
  })

  it('lista vacía muestra el mensaje "No hay nodrizas."', async () => {
    mockFetch({ 'GET /api/naves-nodrizas': [] })

    render(<NavesNodrizasPage />)
    await flush()

    expect(screen.getByText(/no hay nodrizas/i)).toBeInTheDocument()
  })
})
