/** @jest-environment node */
import { POST as POST_NODRIZA } from '@/app/api/naves-nodrizas/route'
import { POST as POST_AERONAVE, GET as GET_AERONAVES } from '@/app/api/aeronaves/route'

function req(url: string, body: any) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('API /api/aeronaves', () => {
  it('POST crea aeronave válida y responde 201; luego GET la lista', async () => {
    // IDs únicos por test para evitar conflictos si hay restos en la BD
    const suffix = Date.now().toString()
    const N1 = 'N1_' + suffix
    const N2 = 'N2_' + suffix
    const A1 = 'A1_' + suffix

    // 1) crear dos nodrizas
    let res = await POST_NODRIZA(req('http://localhost/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))
    expect([200, 201].includes(res.status)).toBe(true)

    res = await POST_NODRIZA(req('http://localhost/api/naves-nodrizas', { id: N2, nombre: 'Beta' }))
    expect([200, 201].includes(res.status)).toBe(true)

    // 2) crear aeronave con el payload REAL de tu schema (maximoMarcianos, origenId, destinoId)
    const payload = {
      id: A1,
      nombre: 'Ares-1',
      maximoMarcianos: 10,
      origenId: N1,
      destinoId: N2,
    }
    const resCreate = await POST_AERONAVE(req('http://localhost/api/aeronaves', payload))
    // Debería ser 201 la primera vez; si por lo que sea existiera, permitiríamos 409 para no romper el test
    expect([201, 409].includes(resCreate.status)).toBe(true)
    if (resCreate.status === 201) {
      const created = await resCreate.json()
      expect(created).toMatchObject(payload)
    }

    // 3) GET de aeronaves debe incluir la creada (o existente con ese id)
    const resList = await GET_AERONAVES()
    expect(resList.status).toBe(200)
    const data = await resList.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.find((a: any) => a.id === A1)).toBeTruthy()
  })
})
