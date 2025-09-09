/** @jest-environment node */
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { GET, POST } from '@/app/api/aeronaves/route'
import { post, unique } from './_helpers'

describe('API /api/aeronaves', () => {
  it('crea aeronave válida (incluye mismo origen/destino) y lista', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf
    await POST_NOD(post('/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))

    const A1 = 'A1_' + suf
    const ok = await POST(post('/api/aeronaves', {
      id: A1, nombre: 'Ares-1', maximoMarcianos: 5, origenId: N1, destinoId: N1 // permitido
    }))
    expect([200, 201].includes(ok.status)).toBe(true)

    const list = await GET()
    expect(list.status).toBe(200)
    const arr = await list.json()
    expect(arr.some((a: any) => a.id === A1 && a.origenId === N1 && a.destinoId === N1)).toBe(true)
  })

  it('rechaza capacidad inválida, faltante, ids de nodrizas inexistentes y duplicados', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf, A1 = 'A1_' + suf
    await POST_NOD(post('', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('', { id: N2, nombre: 'Beta' }))

    const badCap = await POST(post('', { id: unique('A'), nombre: 'X', maximoMarcianos: -1, origenId: N1, destinoId: N2 }))
    expect([400, 422].includes(badCap.status)).toBe(true)

    const badMissing = await POST(post('', { id: unique('A'), nombre: 'X', origenId: N1, destinoId: N2 }))
    expect([400, 422].includes(badMissing.status)).toBe(true)

    const badNod = await POST(post('', { id: unique('A'), nombre: 'X', maximoMarcianos: 1, origenId: 'NOPE', destinoId: 'NOPE' }))
    expect([400, 404, 422, 500].includes(badNod.status)).toBe(true)

    const ok = await POST(post('', { id: A1, nombre: 'Ares-1', maximoMarcianos: 1, origenId: N1, destinoId: N2 }))
    expect([200, 201].includes(ok.status)).toBe(true)
    const dup = await POST(post('', { id: A1, nombre: 'Otro', maximoMarcianos: 2, origenId: N1, destinoId: N2 }))
    expect([409, 400].includes(dup.status)).toBe(true)
  })
})
