/** @jest-environment jsdom */
import React from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react'
import PasajerosPage from '@/app/pasajeros/page'

const makeRes = (body:any, status=200, headers={ 'content-type':'application/json' }) => ({
  ok: status>=200 && status<300,
  status,
  headers:{ get:(k:string)=> (headers as any)[k.toLowerCase()]||null },
  json: async()=> body,
  text: async()=> typeof body==='string'? body: JSON.stringify(body),
})
const flush = ()=> new Promise(r=>setTimeout(r,0))

describe('PasajerosPage – ramas', () => {
  const originalFetch = global.fetch as any
  afterEach(()=> { global.fetch = originalFetch })

  it('sin listas ⇒ POSTs se realizan con ids vacíos (y el body coincide)', async () => {
    let lastAsignar:any = null
    let lastBajar:any = null

    global.fetch = jest.fn(async (url:any, init?:any)=>{
      const u = String(url); const m = (init?.method||'GET').toUpperCase()
      if (u.includes('/api/pasajeros') && m==='GET') return makeRes([])
      if (u.includes('/api/aeronaves') && m==='GET') return makeRes([])

      if (u.includes('/api/pasajeros/asignar') && m==='POST') {
        lastAsignar = JSON.parse(init?.body ?? '{}')
        return makeRes({ error:'faltan ids' }, 422)
      }
      if (u.includes('/api/pasajeros/bajar') && m==='POST') {
        lastBajar = JSON.parse(init?.body ?? '{}')
        return makeRes({ error:'faltan ids' }, 422)
      }
      return makeRes('not found',404,{'content-type':'text/plain'})
    }) as any

    const { getByText, container } = render(<PasajerosPage />)
    await waitFor(()=> (global.fetch as jest.Mock).mock.calls.length>=2)

    // Enviar formulario "Asignar"
    await act(async ()=>{
      const asignarForm = getByText('Asignar').closest('form')!
      fireEvent.submit(asignarForm)
      await flush()
    })
    expect(lastAsignar).toEqual({ pasajeroId:'', aeronaveId:'' })

    // Enviar formulario "Bajar"
    await act(async ()=>{
      const bajarForm = getByText('Bajar').closest('form')!
      fireEvent.submit(bajarForm)
      await flush()
    })
    expect(lastBajar).toEqual({ pasajeroId:'', aeronaveId:'' })
  })
})
