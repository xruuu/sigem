/** @jest-environment node */
import { POST as POST_NOD, GET as GET_NOD } from '@/app/api/naves-nodrizas/route'

const post = (url: string, body: any) =>
  new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

describe('API /api/naves-nodrizas', () => {
  it('crea y lista', async () => {
    const id = 'N' + Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const r1 = await POST_NOD(post('http://localhost/api/naves-nodrizas', { id, nombre: 'Alpha' }))
    expect([200, 201].includes(r1.status)).toBe(true)

    const r2 = await GET_NOD()
    expect(r2.status).toBe(200)
    const list = await r2.json()
    expect(Array.isArray(list)).toBe(true)
    expect(list.some((n: any) => n.id === id)).toBe(true)
  })

  it('rechaza duplicado', async () => {
    const id = 'N' + Date.now() + '_' + Math.floor(Math.random() * 1e6)
    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id, nombre: 'A' }))
    const dup = await POST_NOD(post('http://localhost/api/naves-nodrizas', { id, nombre: 'B' }))
    expect([409, 400].includes(dup.status)).toBe(true)
  })
})
