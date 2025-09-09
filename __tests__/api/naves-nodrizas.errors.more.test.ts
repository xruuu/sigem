/** @jest-environment node */

import { post, get, unique } from './_helpers'
import { POST, GET } from '@/app/api/naves-nodrizas/route'

describe('API /api/naves-nodrizas – validaciones extra', () => {
  it('bloquea ids vacíos o nombre vacío', async () => {
    const bad1 = await POST(post('/api/naves-nodrizas', { id: '', nombre: 'X' }))
    expect([400, 422].includes(bad1.status)).toBe(true)
    const bad2 = await POST(post('', { id: unique('N'), nombre: '' }))
    expect([400, 422].includes(bad2.status)).toBe(true)
  })

  it('GET funciona con y sin datos', async () => {
    const res = await GET()
    expect([200, 204].includes(res.status)).toBe(true)
    if (res.status === 200) {
      const list = await res.json()
      expect(Array.isArray(list)).toBe(true)
    }
  })
})
