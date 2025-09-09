/** @jest-environment node */
import { prisma } from '@/lib/db'
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AER } from '@/app/api/aeronaves/route'
import { POST as POST_PAS } from '@/app/api/pasajeros/route'
import { POST as POST_ASIGNAR } from '@/app/api/pasajeros/asignar/route'
import { POST as POST_REV, GET as GET_REV } from '@/app/api/revisiones/route'

const post = (url: string, body: any) =>
  new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

describe('API /api/revisiones', () => {
  it('crea revisión (foto de a bordo) y GET la lista', async () => {
    const suf = Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf
    const A1 = 'A1_' + suf
    const P1 = 'P1_' + suf, P2 = 'P2_' + suf
    const R1 = 'R1_' + suf
    const FECHA = '2025-08-27'

    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id: N2, nombre: 'Beta' }))
    await POST_AER(post('http://localhost/api/aeronaves', { id: A1, nombre: 'Ares-1', maximoMarcianos: 5, origenId: N1, destinoId: N2 }))

    await POST_PAS(post('http://localhost/api/pasajeros', { id: P1, nombre: 'Mar Uno' }))
    await POST_PAS(post('http://localhost/api/pasajeros', { id: P2, nombre: 'Mar Dos' }))

    await POST_ASIGNAR(post('http://localhost/api/pasajeros/asignar', { pasajeroId: P1, aeronaveId: A1 }))
    await POST_ASIGNAR(post('http://localhost/api/pasajeros/asignar', { pasajeroId: P2, aeronaveId: A1 }))

    const r = await POST_REV(post('http://localhost/api/revisiones', {
      id: R1, nombreRevisor: 'Tec X', aeronaveId: A1, fecha: FECHA
    }))
    expect([200, 201].includes(r.status)).toBe(true)

    const created = await r.json()
    // si tu handler devuelve pasajeros, compróbalo:
    if (created?.pasajeros) {
      expect(new Set(created.pasajeros)).toEqual(new Set([P1, P2]))
    }

    const gl = await GET_REV()
    expect(gl.status).toBe(200)
    const list = await gl.json()
    expect(Array.isArray(list)).toBe(true)
    expect(list.some((rev: any) => rev.id === R1)).toBe(true)
  })

  it('bloquea dos revisiones en el mismo día para la misma aeronave', async () => {
    const suf = Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf
    const A1 = 'A1_' + suf
    const R1 = 'R1_' + suf, R2 = 'R2_' + suf
    const FECHA = '2025-08-27'

    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id: N2, nombre: 'Beta' }))
    await POST_AER(post('http://localhost/api/aeronaves', { id: A1, nombre: 'Ares-1', maximoMarcianos: 5, origenId: N1, destinoId: N2 }))

    const ok = await POST_REV(post('http://localhost/api/revisiones', { id: R1, nombreRevisor: 'Tec1', aeronaveId: A1, fecha: FECHA }))
    expect([200, 201].includes(ok.status)).toBe(true)

    const ko = await POST_REV(post('http://localhost/api/revisiones', { id: R2, nombreRevisor: 'Tec2', aeronaveId: A1, fecha: FECHA }))
    expect([409, 400, 422].includes(ko.status)).toBe(true)
  })

  it('rechaza aeronave inexistente y fechas inválidas', async () => {
    const R = 'R' + Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const badAero = await POST_REV(post('http://localhost/api/revisiones', { id: R, nombreRevisor: 'Tec', aeronaveId: 'NOPE', fecha: '2025-08-27' }))
    expect([404, 400, 422, 500].includes(badAero.status)).toBe(true)

    const suf = Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf, A1 = 'A1_' + suf
    await (await import('@/app/api/naves-nodrizas/route')).POST(new Request('http://localhost/api/naves-nodrizas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: N1, nombre: 'Alpha' }) }))
    await (await import('@/app/api/naves-nodrizas/route')).POST(new Request('http://localhost/api/naves-nodrizas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: N2, nombre: 'Beta' }) }))
    await (await import('@/app/api/aeronaves/route')).POST(new Request('http://localhost/api/aeronaves', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: A1, nombre: 'Ares', maximoMarcianos: 1, origenId: N1, destinoId: N2 }) }))

    const badDate = await POST_REV(post('http://localhost/api/revisiones', { id: R + '_2', nombreRevisor: 'Tec', aeronaveId: A1, fecha: 'fecha-mala' }))
    expect([400, 422].includes(badDate.status)).toBe(true)
  })
})
