import '../setup/request-polyfill'
import { GET as GET_NOD } from '@/app/api/naves-nodrizas/route'
import { GET as GET_AER } from '@/app/api/aeronaves/route'
import { GET as GET_PAS } from '@/app/api/pasajeros/route'
import { GET as GET_REV } from '@/app/api/revisiones/route'

const get = (url: string) => new Request(url, { method: 'GET' })

async function assertGetArrayOr204(handler: (r: Request)=>Promise<Response>, url: string) {
  const res = await handler(get(url))
  expect([200, 204].includes(res.status)).toBe(true)
  if (res.status === 200) {
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  }
}

describe('GET 200/204 compatibles – colecciones', () => {
  it('naves-nodrizas', async () => {
    await assertGetArrayOr204(GET_NOD, 'http://localhost/api/naves-nodrizas')
  })
  it('aeronaves', async () => {
    await assertGetArrayOr204(GET_AER, 'http://localhost/api/aeronaves')
  })
  it('pasajeros', async () => {
    await assertGetArrayOr204(GET_PAS, 'http://localhost/api/pasajeros')
  })
  it('revisiones', async () => {
    await assertGetArrayOr204(GET_REV, 'http://localhost/api/revisiones')
  })
})
