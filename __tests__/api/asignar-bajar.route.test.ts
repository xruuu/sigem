/** @jest-environment node */
import { prisma } from '@/lib/db'
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AER } from '@/app/api/aeronaves/route'
import { POST as POST_PAS } from '@/app/api/pasajeros/route'
import { POST as POST_ASIGNAR } from '@/app/api/pasajeros/asignar/route'
import { POST as POST_BAJAR } from '@/app/api/pasajeros/bajar/route'

const post = (url: string, body: any) =>
  new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

describe('Asignar y bajar pasajeros', () => {
  it('asigna con capacidad, bloquea doble asignación y permite bajar', async () => {
    const suf = Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const N1 = 'N1_' + suf, N2 = 'N2_' + suf
    const A1 = 'A1_' + suf, A2 = 'A2_' + suf
    const P1 = 'P1_' + suf, P2 = 'P2_' + suf

    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))
    await POST_NOD(post('http://localhost/api/naves-nodrizas', { id: N2, nombre: 'Beta' }))

    await POST_AER(post('http://localhost/api/aeronaves', {
      id: A1, nombre: 'Ares-1', maximoMarcianos: 1, origenId: N1, destinoId: N2
    }))
    await POST_AER(post('http://localhost/api/aeronaves', {
      id: A2, nombre: 'Ares-2', maximoMarcianos: 2, origenId: N1, destinoId: N2
    }))

    await POST_PAS(post('http://localhost/api/pasajeros', { id: P1, nombre: 'Mar Uno' }))
    await POST_PAS(post('http://localhost/api/pasajeros', { id: P2, nombre: 'Mar Dos' }))

    // Asignación válida
    const a1 = await POST_ASIGNAR(post('http://localhost/api/pasajeros/asignar', { pasajeroId: P1, aeronaveId: A1 }))
    expect([200, 201].includes(a1.status)).toBe(true)

    // Capacidad 1: no cabe P2 en A1
    const cap = await POST_ASIGNAR(post('http://localhost/api/pasajeros/asignar', { pasajeroId: P2, aeronaveId: A1 }))
    expect([400, 409, 422].includes(cap.status)).toBe(true)

    // P1 no puede estar también en A2
    const dup = await POST_ASIGNAR(post('http://localhost/api/pasajeros/asignar', { pasajeroId: P1, aeronaveId: A2 }))
    expect([400, 409, 422].includes(dup.status)).toBe(true)

    // Bajar P1 de A1 (soft-delete: fechaBajada != null)
    const baj = await POST_BAJAR(post('http://localhost/api/pasajeros/bajar', { pasajeroId: P1, aeronaveId: A1 }))
    expect([200, 204].includes(baj.status)).toBe(true)

    // No debe existir una asignación ACTIVA (fechaBajada null)
    const active = await prisma.pasajeroAeronave.findFirst({
      where: { pasajeroId: P1, aeronaveId: A1, fechaBajada: null }
    })
    expect(active).toBeNull()

    // Ahora P1 puede ir a A2
    const a2 = await POST_ASIGNAR(post('http://localhost/api/pasajeros/asignar', { pasajeroId: P1, aeronaveId: A2 }))
    expect([200, 201].includes(a2.status)).toBe(true)
  })
})
