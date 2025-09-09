/** @jest-environment node */
import { GET, POST } from '@/app/api/naves-nodrizas/route'
import { post, unique } from './_helpers'

describe('API /api/naves-nodrizas', () => {
  it('crea y lista naves; bloquea duplicados; valida payload', async () => {
    const id = unique('N')
    const ok = await POST(post('/api/naves-nodrizas', { id, nombre: 'Alpha' }))
    expect([200, 201].includes(ok.status)).toBe(true)

    const dup = await POST(post('/api/naves-nodrizas', { id, nombre: 'Alpha otra' }))
    expect([409, 400].includes(dup.status)).toBe(true)

    const bad = await POST(post('/api/naves-nodrizas', { id: unique('N') })) // falta nombre
    expect([400, 422].includes(bad.status)).toBe(true)

    const list = await GET()
    expect(list.status).toBe(200)
    const items = await list.json()
    expect(Array.isArray(items)).toBe(true)
    expect(items.some((n: any) => n.id === id)).toBe(true)
  })
})
