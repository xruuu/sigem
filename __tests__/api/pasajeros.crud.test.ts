/** @jest-environment node */
import { GET, POST } from '@/app/api/pasajeros/route'
import { post, unique } from './_helpers'

describe('API /api/pasajeros', () => {
  it('crea, lista, bloquea duplicados y valida payload', async () => {
    const P = unique('P')
    const ok = await POST(post('', { id: P, nombre: 'Mar Uno' }))
    expect([200, 201].includes(ok.status)).toBe(true)

    const dup = await POST(post('', { id: P, nombre: 'Otro' }))
    expect([409, 400].includes(dup.status)).toBe(true)

    const bad = await POST(post('', { id: unique('P') })) // falta nombre
    expect([400, 422].includes(bad.status)).toBe(true)

    const list = await GET()
    expect(list.status).toBe(200)
    const ps = await list.json()
    expect(ps.some((x: any) => x.id === P)).toBe(true)
  })
})
