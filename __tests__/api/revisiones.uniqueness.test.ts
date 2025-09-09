/** @jest-environment node */
import { prisma } from '@/lib/db'
import { POST as POST_REV } from '@/app/api/revisiones/route'

const req = (url: string, body: any) =>
  new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('API /api/revisiones – unicidad por aeronave y día', () => {
  it('rechaza crear dos revisiones para la misma aeronave y mismo día', async () => {
    const suf = Date.now().toString()
    const N1 = 'N1_' + suf
    const N2 = 'N2_' + suf
    const A1 = 'A1_' + suf
    const R1 = 'R1_' + suf
    const R2 = 'R2_' + suf
    const FECHA = '2025-08-27'

    await prisma.naveNodriza.create({ data: { id: N1, nombre: 'Alpha' } })
    await prisma.naveNodriza.create({ data: { id: N2, nombre: 'Beta' } })
    await prisma.aeronave.create({
      data: { id: A1, nombre: 'Ares-1', maximoMarcianos: 10, origenId: N1, destinoId: N2 },
    })

    // primera revisión OK
    const p1 = { id: R1, nombreRevisor: 'Tec1', aeronaveId: A1, fecha: FECHA }
    const r1 = await POST_REV(req('http://localhost/api/revisiones', p1))
    expect([201].includes(r1.status)).toBe(true)

    // segunda revisión mismo día/aeronave => debe fallar (409 recomendado, aceptamos 400/422 si tu handler mapea distinto)
    const p2 = { id: R2, nombreRevisor: 'Tec2', aeronaveId: A1, fecha: FECHA }
    const r2 = await POST_REV(req('http://localhost/api/revisiones', p2))
    expect([409, 400, 422].includes(r2.status)).toBe(true)
  })
})
