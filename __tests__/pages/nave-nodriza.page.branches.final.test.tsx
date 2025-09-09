import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import NodrizasPage from '@/app/naves-nodrizas/page'

const r = (body: any, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }) as any

const flush = () => new Promise(res => setTimeout(res, 0))

describe('NodrizasPage – ramas extra', () => {
  it('201 ⇒ resetea; 409 ⇒ mantiene valores', async () => {
    let first = true

    ;(global as any).fetch = jest.fn(async (url:any, init?: any) => {
      const u = String(url); const m = (init?.method ?? 'GET').toUpperCase()

      if (u.endsWith('/api/naves-nodrizas') && m === 'GET') return r([], 200)
      if (u.endsWith('/api/naves-nodrizas') && m === 'POST') {
        const body = JSON.parse(init!.body as string)
        if (first) { first = false; return r(body, 201) }
        return r({ error:'dup' }, 409)
      }
      return r('not-found', 404)
    }) as any

    const { container } = render(<NodrizasPage />)
    await flush()

    const [id, nombre] = Array.from(container.querySelectorAll('form input')) as HTMLInputElement[]
    // 201 ⇒ resetea
    fireEvent.change(id, { target:{ value:'N1' } })
    fireEvent.change(nombre, { target:{ value:'Nodriza Uno' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(()=>{
      expect(id.value).toBe('')
      expect(nombre.value).toBe('')
    })

    // 409 ⇒ mantiene
    fireEvent.change(id, { target:{ value:'N1' } })
    fireEvent.change(nombre, { target:{ value:'Dup' } })
    fireEvent.submit(container.querySelector('form')!)
    await flush()
    expect(id.value).toBe('N1')
    expect(nombre.value).toBe('Dup')
  })
})
