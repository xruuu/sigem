/** @jest-environment node */

import { post, unique } from './_helpers'
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AERO } from '@/app/api/aeronaves/route'
import { POST as POST_PAS } from '@/app/api/pasajeros/route'
import { POST as POST_ASIG } from '@/app/api/pasajeros/asignar/route'
import { POST as POST_BAJ } from '@/app/api/pasajeros/bajar/route'

describe('Asignar/Bajar – errores', () => {
  it('no asigna si aeronave no existe o pasajero no existe; bajar sin estar asignado', async () => {
    const suf = unique('S')
    const badA = await POST_ASIG(post('/api/pasajeros/asignar', { pasajeroId: 'NOPE', aeronaveId: 'NOPE' }))
    expect([400, 404, 422].includes(badA.status)).toBe(true)

    // prepara un pasajero y una aeronave válida
    const N1 = 'N1_' + suf
    await POST_NOD(post('/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))
    await POST_AERO(post('/api/aeronaves', { id: 'A1_'+suf, nombre: 'A', maximoMarcianos: 1, origenId: N1, destinoId: N1 }))
    await POST_PAS(post('/api/pasajeros', { id: 'P1_'+suf, nombre: 'Mar' }))

    // bajar sin haber sido asignado
    const baj = await POST_BAJ(post('/api/pasajeros/bajar', { pasajeroId: 'P1_'+suf, aeronaveId: 'A1_'+suf }))
    expect([400, 404].includes(baj.status)).toBe(true)
  })

  it('no permite asignar a una aeronave llena', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf
    const A1 = 'A1_' + suf
    const P1 = 'P1_' + suf, P2 = 'P2_' + suf
    await POST_NOD(post('', { id: N1, nombre: 'Alpha' }))
    await POST_AERO(post('', { id: A1, nombre: 'A', maximoMarcianos: 1, origenId: N1, destinoId: N1 }))
    await POST_PAS(post('', { id: P1, nombre: 'Uno' }))
    await POST_PAS(post('', { id: P2, nombre: 'Dos' }))

    const ok = await POST_ASIG(post('', { pasajeroId: P1, aeronaveId: A1 }))
    expect([200, 201].includes(ok.status)).toBe(true)

    const full = await POST_ASIG(post('', { pasajeroId: P2, aeronaveId: A1 }))
    expect([400, 409].includes(full.status)).toBe(true)
  })
})
