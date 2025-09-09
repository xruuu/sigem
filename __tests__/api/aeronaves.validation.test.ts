/** @jest-environment node */
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AER, GET as GET_AER } from '@/app/api/aeronaves/route'

const post = (url: string, body: any) =>
  new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

describe('API /api/aeronaves – validaciones', () => {
  it('requiere que existan al menos nodrizas (o valida origen/destino)', async () => {
    const id = 'A' + Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const r = await POST_AER(post('http://localhost/api/aeronaves', {
      id, nombre: 'Ares', maximoMarcianos: 5, origenId: 'ZZ', destinoId: 'ZZ'
    }))
    // según tu handler: 400 si "no hay nodrizas", 404 si origen/destino inexistentes, o 422 por zod
    expect([400, 404, 422].includes(r.status)).toBe(true)
  })

  it('crea aeronave con nodrizas válidas y aparece en el GET', async () => {
    const suf = Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf, A1 = 'A1_' + suf

    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id: N2, nombre: 'Beta' }))

    const r1 = await POST_AER(post('http://localhost/api/aeronaves', {
      id: A1, nombre: 'Ares-1', maximoMarcianos: 3, origenId: N1, destinoId: N2
    }))
    expect([200, 201].includes(r1.status)).toBe(true)

    const r2 = await GET_AER()
    expect(r2.status).toBe(200)
    const list = await r2.json()
    expect(list.some((a: any) => a.id === A1)).toBe(true)
  })
})
