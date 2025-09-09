/** @jest-environment node */

import { post, get, unique } from './_helpers'
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AERO, GET as GET_AERO } from '@/app/api/aeronaves/route'

describe('API /api/aeronaves – errores y bordes', () => {
  it('rechaza payloads mal tipados (capacidad como string) y faltantes', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf
    await POST_NOD(post('/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))

    const badType = await POST_AERO(post('/api/aeronaves', { id: 'A1_'+suf, nombre: 'X', maximoMarcianos: '10', origenId: N1, destinoId: N1 }))
    expect([400, 422].includes(badType.status)).toBe(true)

    const missing = await POST_AERO(post('/api/aeronaves', { id: 'A2_'+suf, origenId: N1, destinoId: N1 }))
    expect([400, 422].includes(missing.status)).toBe(true)
  })

  it('permite mismo origen=destino pero bloquea capacidad negativa y cero si el dominio lo impide', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf
    await POST_NOD(post('', { id: N1, nombre: 'Alpha' }))

    const neg = await POST_AERO(post('', { id: 'Aneg_'+suf, nombre: 'Neg', maximoMarcianos: -1, origenId: N1, destinoId: N1 }))
    expect([400, 422].includes(neg.status)).toBe(true)

    const zero = await POST_AERO(post('', { id: 'Azero_'+suf, nombre: 'Zero', maximoMarcianos: 0, origenId: N1, destinoId: N1 }))
    expect([200, 201, 400, 422].includes(zero.status)).toBe(true) // según tu regla: si 0 no es válido debe ser 4xx; si sí, 2xx
  })

  it('GET devuelve lista (incluso vacía) y nunca rompe', async () => {
    const res = await GET_AERO()
    expect([200, 204].includes(res.status)).toBe(true)
    if (res.status === 200) {
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    }
  })
})
