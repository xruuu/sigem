/** @jest-environment node */

import { post, unique } from './_helpers'
import { POST } from '@/app/api/pasajeros/route'

describe('API /api/pasajeros – payload inválido y duplicados', () => {
  it('rechaza falta de nombre o id', async () => {
    const bad1 = await POST(post('/api/pasajeros', { id: '', nombre: 'Mar Uno' }))
    const bad2 = await POST(post('', { id: unique('P'), nombre: '' }))
    expect([400, 422].includes(bad1.status)).toBe(true)
    expect([400, 422].includes(bad2.status)).toBe(true)
  })

  it('marca duplicado (409)', async () => {
    const P = unique('P')
    const ok = await POST(post('', { id: P, nombre: 'Mar Uno' }))
    expect([200, 201].includes(ok.status)).toBe(true)
    const dup = await POST(post('', { id: P, nombre: 'Otro' }))
    expect([409, 400].includes(dup.status)).toBe(true)
  })
})
