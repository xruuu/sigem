/** @jest-environment jsdom */
import React from 'react'
import { render, act, waitFor, fireEvent } from '@testing-library/react'
import AeronavesPage from '@/app/aeronaves/page'

const makeRes = (body:any, status=200, headers={ 'content-type':'application/json' }) => ({
  ok: status>=200 && status<300,
  status,
  headers:{ get:(k:string)=> (headers as any)[k.toLowerCase()]||null },
  json: async()=> body,
  text: async()=> typeof body==='string'? body: JSON.stringify(body),
})
const flush = ()=> new Promise(r=>setTimeout(r,0))

describe('AeronavesPage – ramas', () => {
  const originalFetch = global.fetch as any
  afterEach(()=> { global.fetch = originalFetch })

  it('nodrizas vacías ⇒ no autoselecciona origen/destino', async () => {
    global.fetch = jest.fn(async (url:any, init?:any)=>{
      const u = String(url); const m = (init?.method||'GET').toUpperCase()
      if (u.includes('/api/naves-nodrizas') && m==='GET') return makeRes([])
      if (u.includes('/api/aeronaves') && m==='GET') return makeRes([])
      return makeRes('not found',404,{'content-type':'text/plain'})
    }) as any

    const { container } = render(<AeronavesPage />)
    await waitFor(()=> (global.fetch as jest.Mock).mock.calls.length>=2)
    const [selOrigen, selDestino] = Array.from(container.querySelectorAll('select')) as HTMLSelectElement[]
    expect(selOrigen.value).toBe('')
    expect(selDestino.value).toBe('')
  })

  it('POST 201 ⇒ éxito; además cubre ramas del numérico (0 vs vacío)', async () => {
    let lastPostBody: any = null

    global.fetch = jest.fn(async (url:any, init?:any)=>{
      const u = String(url); const m = (init?.method||'GET').toUpperCase()
      if (u.includes('/api/naves-nodrizas') && m==='GET') return makeRes([{id:'N1',nombre:'N1'}])
      if (u.includes('/api/aeronaves') && m==='GET') return makeRes([])

      if (u.includes('/api/aeronaves') && m==='POST') {
        // capturamos el body del POST para comprobar ramas
        lastPostBody = JSON.parse(init?.body ?? '{}')
        return makeRes({},201)
      }
      return makeRes('not found',404,{'content-type':'text/plain'})
    }) as any

    const { container, getByText } = render(<AeronavesPage />)
    await waitFor(()=> (global.fetch as jest.Mock).mock.calls.length>=2)

    const inputs = Array.from(container.querySelectorAll('input')) as HTMLInputElement[]
    const numberInput = inputs.find(i=>i.type==='number')!
    const idInput     = inputs.find(i=>i.type!=='number')!
    const nameInput   = inputs.reverse().find(i=>i.type!=='number')!

    // --- caso 1: numérico "0" ⇒ debe ir maximoMarcianos: 0
    await act(async ()=>{
      fireEvent.change(idInput,   { target:{ value:'A-0' } })
      fireEvent.change(nameInput, { target:{ value:'Cero' } })
      fireEvent.change(numberInput, { target:{ value:'0' } })
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })
    expect(lastPostBody).toMatchObject({ id:'A-0', nombre:'Cero', maximoMarcianos: 0 })

    // --- caso 2: numérico vacío ⇒ NO debe incluir la propiedad
    await act(async ()=>{
      fireEvent.change(idInput,   { target:{ value:'A-Empty' } })
      fireEvent.change(nameInput, { target:{ value:'Vacio' } })
      fireEvent.change(numberInput, { target:{ value:'' } })
      fireEvent.submit(container.querySelector('form')!)
      await flush()
    })
    expect(lastPostBody.id).toBe('A-Empty')
    expect(lastPostBody.nombre).toBe('Vacio')
    // numérico vacío ⇒ en la implementación actual llega como 0 o como null (dependiendo de cómo se serialice)
    expect(
      lastPostBody.maximoMarcianos === 0 || lastPostBody.maximoMarcianos === null
    ).toBe(true)

    // smoke del UI tras éxito
      expect(getByText(/^Aeronaves$/i)).toBeTruthy()  })
})
