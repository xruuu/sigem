/** @jest-environment node */
/**
 * __tests__/api/get-empty-lists.test.ts
 *
 * Comprueba que los GET de listas devuelven 200 y un array JSON.
 * No asume BD vacía para no depender del orden de ejecución de suites.
 */

import { NextRequest } from 'next/server'
import { GET as GET_AER } from '@/app/api/aeronaves/route'
import { GET as GET_PAS } from '@/app/api/pasajeros/route'
import { GET as GET_NOD } from '@/app/api/naves-nodrizas/route'
import { GET as GET_REV } from '@/app/api/revisiones/route'

const getReq = (url: string) => new NextRequest(url)

const expectArrayOk = (data: any) => {
  expect(Array.isArray(data)).toBe(true)
  // Si hay elementos, validamos una forma mínima
  if (data.length > 0) {
    const item = data[0]
    expect(item).toBeTruthy()
    expect(typeof item).toBe('object')
  }
}

describe('GET vacíos – listas', () => {
  it('GET /api/aeronaves → 200 y array', async () => {
    const res = await GET_AER()
    expect(res.status).toBe(200)
    const data = await res.json()
    expectArrayOk(data)
  })

  it('GET /api/pasajeros → 200 y array', async () => {
    const res = await GET_PAS()
    expect(res.status).toBe(200)
    const data = await res.json()
    expectArrayOk(data)
  })

  it('GET /api/naves-nodrizas → 200 y array', async () => {
    const res = await GET_NOD()
    expect(res.status).toBe(200)
    const data = await res.json()
    expectArrayOk(data)
  })

  it('GET /api/revisiones → 200 y array', async () => {
    const res = await GET_REV()
    expect(res.status).toBe(200)
    const data = await res.json()
    expectArrayOk(data)
  })
})
