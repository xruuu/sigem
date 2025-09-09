/** @jest-environment node */

import { post, unique } from './_helpers'
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AERO } from '@/app/api/aeronaves/route'
import { POST as POST_REV } from '@/app/api/revisiones/route'

describe('API /api/revisiones – más validaciones', () => {
  it('rechaza fecha inválida, aeronave inexistente y nombre revisor vacío', async () => {
    const R = 'R' + unique()
    const badDate = await POST_REV(post('/api/revisiones', { id: R, nombreRevisor: 'Tec', aeronaveId: 'NOPE', fecha: '2025-99-99' }))
    expect([400, 422, 404, 500].includes(badDate.status)).toBe(true)

    const suf = unique('S')
    const N1 = 'N1_' + suf, A1 = 'A1_' + suf
    await POST_NOD(post('/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))
    await POST_AERO(post('/api/aeronaves', { id: A1, nombre: 'A', maximoMarcianos: 5, origenId: N1, destinoId: N1 }))

    const emptyRev = await POST_REV(post('', { id: 'R_'+suf, nombreRevisor: '', aeronaveId: A1, fecha: '2025-01-01' }))
    expect([400, 422].includes(emptyRev.status)).toBe(true)
  })
})
