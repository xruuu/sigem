import '../setup/request-polyfill'
import { GET as GET_REV } from '@/app/api/revisiones/route'
import { prisma } from '@/lib/prisma'

const get = (url = 'http://localhost/api/revisiones') =>
  new Request(url, { method: 'GET' })

describe('GET /api/revisiones – vacío + headers + shape', () => {
  beforeAll(async () => {
    // limpiamos todo para forzar lista vacía (respeta FKs)
    try { await prisma.revisionPasajero.deleteMany() } catch {}
    try { await prisma.revision.deleteMany() } catch {}
    try { await prisma.pasajeroAeronave.deleteMany() } catch {}
    try { await prisma.pasajero.deleteMany() } catch {}
    try { await prisma.aeronave.deleteMany() } catch {}
    try { await prisma.naveNodriza.deleteMany() } catch {}
  })

  it('devuelve 200 o 204; si 200 → JSON array; content-type (si está) es JSON', async () => {
    const res = await GET_REV()

    // 200/204 compatibles
    expect([200, 204].includes(res.status)).toBe(true)

    // content-type (opcional) → si existe, debe ser JSON
    const ct = res.headers.get('content-type')
    if (ct) expect(ct.toLowerCase()).toMatch(/application\/json/)

    // si 200, el body debe ser un array; si 204 puede no haber body
    if (res.status === 200) {
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)

      // Si la lista no está vacía, validamos shape básico
      if (data.length > 0) {
        for (const it of data) {
          expect(typeof it).toBe('object')
          // campos usuales; solo comprobamos presencia si existen
          if ('id' in it) expect(typeof it.id).toBe('string')
          if ('nombreRevisor' in it) expect(typeof it.nombreRevisor).toBe('string')
          if ('fecha' in it) expect(typeof it.fecha === 'string' || it.fecha instanceof Date).toBe(true)
          if ('aeronaveId' in it) expect(typeof it.aeronaveId).toBe('string')
          if ('pasajeros' in it) expect(Array.isArray(it.pasajeros)).toBe(true)
        }
      }
    }
  })
})
