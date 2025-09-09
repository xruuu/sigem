/** @jest-environment node */
import { POST as POST_PAS, GET as GET_PAS } from '@/app/api/pasajeros/route'

const post = (url: string, body: any) =>
  new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('API /api/pasajeros', () => {
  it('crea pasajero válido y luego aparece en el GET', async () => {
    const id = 'P' + Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const r1 = await POST_PAS(post('http://localhost/api/pasajeros', { id, nombre: 'Marciano Uno' }))
    expect([200, 201].includes(r1.status)).toBe(true)

    const r2 = await GET_PAS()
    expect(r2.status).toBe(200)
    const list = await r2.json()
    expect(Array.isArray(list)).toBe(true)
    expect(list.some((p: any) => p.id === id)).toBe(true)
  })

  it('rechaza payload incompleto', async () => {
    const r = await POST_PAS(post('http://localhost/api/pasajeros', { nombre: 'Sin ID' }))
    expect([400, 422].includes(r.status)).toBe(true)
  })

  it('rechaza duplicados por id', async () => {
    const id = 'P' + Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const a = await POST_PAS(post('http://localhost/api/pasajeros', { id, nombre: 'Dup' }))
    expect([200, 201].includes(a.status)).toBe(true)
    const b = await POST_PAS(post('http://localhost/api/pasajeros', { id, nombre: 'Dup-2' }))
    expect([409, 400].includes(b.status)).toBe(true)
  })
})
