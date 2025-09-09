import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import RevisionesPage from '@/app/revisiones/page'

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
    if (!cfg) return { ok: false, status: 404, json: async () => ({ error: 'not-found' }) } as any
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (init?.body) { try { posted[key] = JSON.parse(init.body as string) } catch { posted[key] = init.body } }
    }
    if (Array.isArray(cfg) || (cfg && typeof cfg === 'object' && !('ok' in cfg))) {
      return { ok: true, status: 200, json: async () => cfg } as any
    }
    const { ok = true, status = (ok ? 200 : 500), json } = cfg as any
    return { ok, status, json: async () => json } as any
  })
  ;(fn as any).lastPosted = (path: string) => posted[`POST ${path}`]
  global.fetch = fn as any
  return { lastPosted: (path: string) => posted[`POST ${path}`], fn }
}
/** Fin helpers **/

describe('RevisionesPage – éxito al crear revisión', () => {
  it('POST 201 resetea y muestra mensaje', async () => {
    mockFetch({
      'GET /api/aeronaves': [{ id: 'A1', nombre: 'Uno' }],
      'GET /api/revisiones': [],
      'POST /api/revisiones': { ok: true, json: { id: 'R-OK' } }
    })
    const { container } = renderPage(<RevisionesPage />)
    await flush()

    fireEvent.change(container.querySelector('input[placeholder="identificador"]')!, { target: { value: 'R1' } })
    fireEvent.change(container.querySelector('input[placeholder="nombre del revisor"]')!, { target: { value: 'Zaphod' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'A1' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    await flush()

    // mensaje y reset de inputs (id y nombre)
    expect(screen.getByText('Revisión creada.')).toBeInTheDocument()
    expect((container.querySelector('input[placeholder="identificador"]') as HTMLInputElement).value).toBe('')
    expect((container.querySelector('input[placeholder="nombre del revisor"]') as HTMLInputElement).value).toBe('')
  })
})
