/** @jest-environment node */
import { prisma } from '@/lib/db'
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AER } from '@/app/api/aeronaves/route'
import { POST as POST_PAS } from '@/app/api/pasajeros/route'
import { POST as POST_ASIGNAR } from '@/app/api/pasajeros/asignar/route'
import { POST as POST_BAJAR } from '@/app/api/pasajeros/bajar/route'
import { post, unique } from './_helpers'

describe('Asignaciones – ciclo completo', () => {
  it('respeta capacidad, evita duplicados y permite baja + reasignación', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf
    const A1 = 'A1_' + suf, A2 = 'A2_' + suf
    const P1 = 'P1_' + suf, P2 = 'P2_' + suf

    await POST_NOD(post('', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('', { id: N2, nombre: 'Beta' }))
    await POST_AER(post('', { id: A1, nombre: 'Ares-1', maximoMarcianos: 1, origenId: N1, destinoId: N2 }))
    await POST_AER(post('', { id: A2, nombre: 'Ares-2', maximoMarcianos: 2, origenId: N1, destinoId: N2 }))
    await POST_PAS(post('', { id: P1, nombre: 'Mar Uno' }))
    await POST_PAS(post('', { id: P2, nombre: 'Mar Dos' }))

    const a1 = await POST_ASIGNAR(post('/api/pasajeros/asignar', { pasajeroId: P1, aeronaveId: A1 }))
    expect([200, 201].includes(a1.status)).toBe(true)

    const cap = await POST_ASIGNAR(post('/api/pasajeros/asignar', { pasajeroId: P2, aeronaveId: A1 }))
    expect([400, 409, 422].includes(cap.status)).toBe(true)

    const dup = await POST_ASIGNAR(post('/api/pasajeros/asignar', { pasajeroId: P1, aeronaveId: A2 }))
    expect([400, 409, 422].includes(dup.status)).toBe(true)

    const baj = await POST_BAJAR(post('/api/pasajeros/bajar', { pasajeroId: P1, aeronaveId: A1 }))
    expect([200, 204].includes(baj.status)).toBe(true)

    const active = await prisma.pasajeroAeronave.findFirst({ where: { pasajeroId: P1, aeronaveId: A1, fechaBajada: null } })
    expect(active).toBeNull()

    const ok2 = await POST_ASIGNAR(post('/api/pasajeros/asignar', { pasajeroId: P1, aeronaveId: A2 }))
    expect([200, 201].includes(ok2.status)).toBe(true)
  })

  it('errores de payload e inexistentes', async () => {
    const r1 = await POST_ASIGNAR(post('', { pasajeroId: 'Pxx' })) // falta aeronaveId
    expect([400, 422].includes(r1.status)).toBe(true)

    const r2 = await POST_BAJAR(post('', { pasajeroId: 'NOPE', aeronaveId: 'NOPE' }))
    expect([400, 404, 422].includes(r2.status)).toBe(true)
  })
})
