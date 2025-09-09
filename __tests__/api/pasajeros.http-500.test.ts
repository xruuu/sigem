import '../setup/request-polyfill'

describe('POST /api/pasajeros – error 500 genérico', () => {
  const mute = jest.spyOn(console, 'log').mockImplementation(() => {})

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('si Prisma lanza error genérico → 500 y JSON con error', async () => {
    let POST_PAS: (req: Request) => Promise<Response>

    jest.isolateModules(() => {
      jest.doMock('@prisma/client', () => {
        class PrismaClientMock {
          pasajero = {
            create: jest.fn(() => { throw new Error('db boom') }),
            findMany: jest.fn(async () => []),
          }
        }
        return { __esModule: true, PrismaClient: PrismaClientMock }
      })
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@/app/api/pasajeros/route')
      POST_PAS = mod.POST
    })

    const req = new Request('http://localhost/api/pasajeros', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'P_ERR', nombre: 'X' }),
    })

    const res = await POST_PAS!(req)
    expect(res.status).toBe(500)
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    expect(ct).toContain('application/json')
    const body = await res.json()
    expect(typeof body.error).toBe('string')
  })

  afterAll(() => mute.mockRestore())
})
