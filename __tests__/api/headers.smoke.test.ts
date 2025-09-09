import '../setup/request-polyfill'
import { GET as GET_NOD, POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { GET as GET_AER,  POST as POST_AER } from '@/app/api/aeronaves/route'
import { GET as GET_PAS,  POST as POST_PAS } from '@/app/api/pasajeros/route'
import { GET as GET_REV,  POST as POST_REV } from '@/app/api/revisiones/route'

const get = (url: string) => new Request(url, { method: 'GET' })
const post = (url: string, body: any) =>
  new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

describe('Handlers expuestos y headers básicos', () => {
  it('exportan GET/POST como funciones', () => {
    for (const f of [GET_NOD, POST_NOD, GET_AER, POST_AER, GET_PAS, POST_PAS, GET_REV, POST_REV]) {
      expect(typeof f).toBe('function')
    }
  })

  it('GET responde y, si hay content-type, es JSON', async () => {
    const checks = [
      GET_NOD(),
      GET_AER(),
      GET_PAS(),
      GET_REV(),
    ]
    const results = await Promise.all(checks)
    for (const res of results) {
      expect([200, 204].includes(res.status)).toBe(true)
      const ct = res.headers.get('content-type')
      if (ct) expect(ct.toLowerCase()).toMatch(/application\/json/)
    }
  })

  it('POST con payload vacío devuelve error (400/422/405/500) sin reventar', async () => {
    const empties = [
      POST_NOD(post('http://localhost/api/naves-nodrizas', {})),
      POST_AER(post('http://localhost/api/aeronaves', {})),
      POST_PAS(post('http://localhost/api/pasajeros', {})),
      POST_REV(post('http://localhost/api/revisiones', {})),
    ]
    const results = await Promise.all(empties)
    for (const res of results) {
      // No imponemos política exacta; solo que no sea 200/201 con body vacío
      expect([400, 401, 403, 404, 405, 409, 422, 500].includes(res.status)).toBe(true)
    }
  })
})
