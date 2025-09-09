import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import AeronavesPage from '@/app/aeronaves/page'

/** Helpers locales **/
function renderPage(ui: React.ReactElement) { return render(ui) }
async function flush() { await act(async () => { await Promise.resolve() }) }
function mockFetch(routes: Record<string, any>) {
  const posted: Record<string, any> = {}
  const fn = jest.fn(async (input: any, init?: any) => {
    const raw = typeof input === 'string' ? input : input.url
    const method = (init?.method ?? 'GET').toUpperCase()
    const path = raw.includes('://') ? new URL(raw).pathname : raw
    const key = `${method} ${path}`
    const cfg = routes[key]
    if (!cfg) return { ok: false, status: 404, json: async () => ({ error: 'not-found' }), text: async () => 'not-found' } as any
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (init?.body) { try { posted[key] = JSON.parse(init.body as string) } catch { posted[key] = init.body } }
    }
    // Atajo: si cfg es array/obj sin 'ok', devolvemos 200 con ese json
    if (Array.isArray(cfg) || (cfg && typeof cfg === 'object' && !('ok' in cfg))) {
      return { ok: true, status: 200, json: async () => cfg, text: async () => JSON.stringify(cfg) } as any
    }
    const { ok = true, status = (ok ? 200 : 500), json, text } = cfg as any
    return {
      ok,
      status,
      json: async () => (json ?? (text ? { error: text } : undefined)),
      text: async () => (text ?? (json ? JSON.stringify(json) : ''))
    } as any
  })
  ;(fn as any).lastPosted = (path: string) => posted[`POST ${path}`]
  global.fetch = fn as any
  return { lastPosted: (path: string) => posted[`POST ${path}`], fn }
}
/** Fin helpers **/

describe('AeronavesPage – ramas extra', () => {
  it('muestra listado con filas cuando GET retorna elementos', async () => {
    mockFetch({
      'GET /api/aeronaves': [
        { id: 'A1', nombre: 'Uno', maximoMarcianos: 3, origenId: 'N1', destinoId: 'N2', ocupacion: 2 }
      ],
      'GET /api/naves-nodrizas': [{ id: 'N1' }, { id: 'N2' }],
      'POST /api/aeronaves': { ok: true, json: {} }
    })
    renderPage(<AeronavesPage />)
    await flush()

    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('Uno')).toBeInTheDocument()
    expect(screen.getByText('N1')).toBeInTheDocument()
    expect(screen.getByText('N2')).toBeInTheDocument()
  })

  it('POST 422 muestra el texto de error devuelto', async () => {
    mockFetch({
      'GET /api/aeronaves': [],
      'GET /api/naves-nodrizas': [{ id: 'N1' }, { id: 'N2' }],
      // ➜ devolvemos json con { error: '...' } porque la página hace res.json()
      'POST /api/aeronaves': { ok: false, status: 422, json: { error: 'ID duplicado' } }
    })
    const { container } = renderPage(<AeronavesPage />)
    await flush()

    fireEvent.change(container.querySelector('input[placeholder="identificador"]')!, { target: { value: 'A1' } })
    fireEvent.change(container.querySelector('input[placeholder="nombre"]')!, { target: { value: 'Uno' } })
    fireEvent.change(container.querySelector('input[placeholder="máximo de pasajeros"]')!, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /crear/i }))
    await flush()

    expect(screen.getByText(/duplicado/i)).toBeInTheDocument()
  })
})
