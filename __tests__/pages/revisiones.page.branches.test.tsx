/** @jest-environment jsdom */
import React from 'react'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import RevisionesPage from '@/app/revisiones/page'

const makeRes = (body:any, status=200, headers={ 'content-type':'application/json' }) => ({
  ok: status>=200 && status<300,
  status,
  headers:{ get:(k:string)=> (headers as any)[k.toLowerCase()]||null },
  json: async()=> body,
  text: async()=> typeof body==='string'? body: JSON.stringify(body),
})
const flush = ()=> new Promise(r=>setTimeout(r,0))

describe('RevisionesPage – ramas', () => {
  const originalFetch = global.fetch as any
  afterEach(()=> { global.fetch = originalFetch })

  it('histórico con filas', async () => {
    global.fetch = jest.fn(async (url:any, init?:any)=>{
      const u = String(url); const m = (init?.method||'GET').toUpperCase()
      if (u.includes('/api/revisiones') && m==='GET') {
        return makeRes([{
            id:'R1', revisor:'Zaphod', aeronaveId:'A1',
            fecha:'2024-01-01', pasajeros:['P1','P2']
        }])
      }
      if (u.includes('/api/aeronaves') && m==='GET') {
        return makeRes([{ id:'A1', nombre:'Aeronave Uno' }])
      }
      return makeRes('not found',404,{'content-type':'text/plain'})
    }) as any

    render(<RevisionesPage />)
    await waitFor(()=> expect(screen.queryByText('No hay revisiones.')).toBeNull())

    expect(screen.getByText('R1')).toBeInTheDocument()
    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('P1, P2')).toBeInTheDocument()  })

  it('aeronaves vacías + POST 422 (mantiene valores)', async () => {
    let lastPost:any = null

    global.fetch = jest.fn(async (url:any, init?:any)=>{
      const u = String(url); const m = (init?.method||'GET').toUpperCase()
      if (u.includes('/api/revisiones') && m==='GET') return makeRes([])
      if (u.includes('/api/aeronaves') && m==='GET') return makeRes([])

      if (u.includes('/api/revisiones') && m==='POST') {
        lastPost = JSON.parse(init?.body ?? '{}')
        // sin aeronaveId ⇒ 422
        if (!lastPost.aeronaveId) return makeRes({ error:'validación' }, 422)
        return makeRes({}, 201)
      }
      return makeRes('not found',404,{'content-type':'text/plain'})
    }) as any

    const { container } = render(<RevisionesPage />)
    await waitFor(()=> (global.fetch as jest.Mock).mock.calls.length>=2)

    // Rellenamos id y nombre del revisor, NO seleccionamos aeronave (select vacío por defecto)
    const idInput = container.querySelector('input[placeholder="identificador"]') as HTMLInputElement
    const revInput = container.querySelector('input[placeholder="nombre del revisor"]') as HTMLInputElement
    expect(idInput).toBeTruthy()
    expect(revInput).toBeTruthy()

    await act(async ()=>{
      fireEvent.change(idInput,  { target:{ value:'R-422' } })
      fireEvent.change(revInput, { target:{ value:'Ford' } })
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })

    // Se envió POST sin aeronaveId
    expect(lastPost.id).toBe('R-422')
    expect(lastPost.aeronaveId ?? '').toBe('') // vacío/ausente
    // Tras 422, inputs mantienen sus valores
    expect((container.querySelector('input[placeholder="identificador"]') as HTMLInputElement).value).toBe('R-422')
    expect((container.querySelector('input[placeholder="nombre del revisor"]') as HTMLInputElement).value).toBe('Ford')
  })
})
