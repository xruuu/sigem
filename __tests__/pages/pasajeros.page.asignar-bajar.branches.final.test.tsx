import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import PasajerosPage from '@/app/pasajeros/page'

/** Helpers locales **/
function renderPage(ui: React.ReactElement) {
  return render(ui)
}
async function flush() {
  await act(async () => { await Promise.resolve(); })
}
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

describe('PasajerosPage – ramas extra de asignar/bajar', () => {
  it('muestra mensaje de éxito al asignar; y error al bajar', async () => {
    const m = mockFetch({
      'GET /api/aeronaves': [{ id: 'A1', nombre: 'Aeronave Uno', maximoMarcianos: 2, origenId: 'N1', destinoId: 'N2' }],
      'GET /api/pasajeros': [{ id: 'P1', nombre: 'Ford' }],
      'POST /api/pasajeros/asignar': { ok: true, json: { id: 1 } },
      // ➜ error con json { error: ... }
      'POST /api/pasajeros/bajar': { ok: false, status: 404, json: { error: 'No asignado' } },
    })
    renderPage(<PasajerosPage />)
    await flush()

    // Asignar
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'P1' } })
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'A1' } })
    fireEvent.click(screen.getByRole('button', { name: /asignar/i }))
    await flush()

    expect(m.lastPosted('/api/pasajeros/asignar')).toMatchObject({ pasajeroId: 'P1', aeronaveId: 'A1' })
    expect(screen.getByText(/asignad/i)).toBeInTheDocument()

    // Bajar (error 404)
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'P1' } })
    fireEvent.change(screen.getAllByRole('combobox')[3], { target: { value: 'A1' } })
    fireEvent.click(screen.getByRole('button', { name: /bajar/i }))
    await flush()

    expect(m.lastPosted('/api/pasajeros/bajar')).toMatchObject({ pasajeroId: 'P1', aeronaveId: 'A1' })
    expect(screen.getByText(/no asignado/i)).toBeInTheDocument()
  })

  it('muestra error al asignar y éxito al bajar', async () => {
    mockFetch({
      'GET /api/aeronaves': [{ id: 'A1', nombre: 'Aeronave Uno', maximoMarcianos: 2, origenId: 'N1', destinoId: 'N2' }],
      'GET /api/pasajeros': [{ id: 'P1', nombre: 'Ford' }],
      // ➜ error con json { error: ... }
      'POST /api/pasajeros/asignar': { ok: false, status: 409, json: { error: 'Aeronave llena' } },
      'POST /api/pasajeros/bajar': { ok: true, json: { id: 1, activo: false } },
    })
    renderPage(<PasajerosPage />)
    await flush()

    // Asignar (error 409)
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'P1' } })
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'A1' } })
    fireEvent.click(screen.getByRole('button', { name: /asignar/i }))
    await flush()
    expect(screen.getByText(/llena/i)).toBeInTheDocument()

    // Bajar (ok)
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'P1' } })
    fireEvent.change(screen.getAllByRole('combobox')[3], { target: { value: 'A1' } })
    fireEvent.click(screen.getByRole('button', { name: /bajar/i }))
    await flush()
    expect(screen.getByText(/bajad/i)).toBeInTheDocument()
  })
})
