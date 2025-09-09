/** @jest-environment node */
import { prisma } from '@/lib/db'
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AER, GET as GET_AER } from '@/app/api/aeronaves/route'
import { POST as POST_PAS } from '@/app/api/pasajeros/route'
import { POST as POST_ASIGNAR } from '@/app/api/pasajeros/asignar/route'
import { POST as POST_BAJAR } from '@/app/api/pasajeros/bajar/route'
import { POST as POST_REV, GET as GET_REV } from '@/app/api/revisiones/route'
import { post, unique } from './_helpers'

describe('API /api/revisiones', () => {
  it('crea revisión arrastrando pasajeros a bordo; en DB quedan vinculados', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf, A1 = 'A1_' + suf
    const P1 = 'P1_' + suf, P2 = 'P2_' + suf
    await POST_NOD(post('', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('', { id: N2, nombre: 'Beta' }))
    await POST_AER(post('', { id: A1, nombre: 'Ares-1', maximoMarcianos: 3, origenId: N1, destinoId: N2 }))
    await POST_PAS(post('', { id: P1, nombre: 'Mar Uno' }))
    await POST_PAS(post('', { id: P2, nombre: 'Mar Dos' }))
    await POST_ASIGNAR(post('', { pasajeroId: P1, aeronaveId: A1 }))
    await POST_ASIGNAR(post('', { pasajeroId: P2, aeronaveId: A1 }))

    const R1 = 'R1_' + suf
    const FECHA = '2025-08-28'
    const rev = await POST_REV(post('', { id: R1, nombreRevisor: 'Tec', aeronaveId: A1, fecha: FECHA }))
    expect([200, 201].includes(rev.status)).toBe(true)

    // la revisión existe
    const rDb = await prisma.revision.findUnique({ where: { id: R1 } })
    expect(rDb?.aeronaveId).toBe(A1)
    // pasajeros asociados a esa revisión (2)
    const pasajerosRev = await prisma.revisionPasajero.findMany({ where: { revisionId: R1 } })
    expect(pasajerosRev.map(x => x.pasajeroId).sort()).toEqual([P1, P2].sort())

    // GET list
    const list = await GET_REV()
    expect(list.status).toBe(200)
    const all = await list.json()
    expect(all.some((r: any) => r.id === R1)).toBe(true)
  })

  it('respeta unicidad (1 revisión por aeronave y día); valida payload y aeronave inexistente', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf, A1 = 'A1_' + suf
    await POST_NOD(post('', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('', { id: N2, nombre: 'Beta' }))
    await POST_AER(post('', { id: A1, nombre: 'Ares-1', maximoMarcianos: 2, origenId: N1, destinoId: N2 }))

    const R = 'R_' + suf
    const FECHA = '2025-08-27'
    const ok = await POST_REV(post('', { id: R, nombreRevisor: 'Tec', aeronaveId: A1, fecha: FECHA }))
    expect([200, 201].includes(ok.status)).toBe(true)

    const dup = await POST_REV(post('', { id: 'R2_' + suf, nombreRevisor: 'Tec', aeronaveId: A1, fecha: FECHA }))
    expect([409, 400, 422].includes(dup.status)).toBe(true)

    const badAero = await POST_REV(post('', { id: 'R3_' + suf, nombreRevisor: 'Tec', aeronaveId: 'NOPE', fecha: FECHA }))
    expect([404, 400, 422, 500].includes(badAero.status)).toBe(true)

    const badDate = await POST_REV(post('', { id: 'R4_' + suf, nombreRevisor: 'Tec', aeronaveId: A1, fecha: 'no-fecha' }))
    expect([400, 422].includes(badDate.status)).toBe(true)

    const badPayload = await POST_REV(post('', { id: 'R5_' + suf, aeronaveId: A1, fecha: FECHA })) // falta revisor
    expect([400, 422].includes(badPayload.status)).toBe(true)

    // sanity: GET aeronaves sigue ok
    const ga = await GET_AER()
    expect(ga.status).toBe(200)
  })

  it('si se baja un pasajero antes de la revisión, no aparece en la lista de esa revisión', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf, A1 = 'A1_' + suf
    const P1 = 'P1_' + suf, P2 = 'P2_' + suf
    await POST_NOD(post('', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('', { id: N2, nombre: 'Beta' }))
    await POST_AER(post('', { id: A1, nombre: 'Ares-1', maximoMarcianos: 3, origenId: N1, destinoId: N2 }))
    await POST_PAS(post('', { id: P1, nombre: 'Mar Uno' }))
    await POST_PAS(post('', { id: P2, nombre: 'Mar Dos' }))
    await POST_ASIGNAR(post('', { pasajeroId: P1, aeronaveId: A1 }))
    await POST_ASIGNAR(post('', { pasajeroId: P2, aeronaveId: A1 }))

    // baja P2 antes de la revisión
    await POST_BAJAR(post('', { pasajeroId: P2, aeronaveId: A1 }))

    const R1 = 'R1_' + suf
    const FECHA = '2025-08-28'
    const rev = await POST_REV(post('', { id: R1, nombreRevisor: 'Tec', aeronaveId: A1, fecha: FECHA }))
    expect([200, 201].includes(rev.status)).toBe(true)

    const pasajerosRev = await prisma.revisionPasajero.findMany({ where: { revisionId: R1 } })
    expect(pasajerosRev.map(x => x.pasajeroId)).toEqual([P1]) // solo P1 activo
  })
})
