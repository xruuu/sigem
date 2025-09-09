import '../setup/request-polyfill'

describe('POST /api/aeronaves – error 500 genérico', () => {
  const mute = jest.spyOn(console, 'log').mockImplementation(() => {})

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('si Prisma falla → 500 y JSON', async () => {
    let POST_AER: (req: Request) => Promise<Response>

    jest.isolateModules(() => {
      jest.doMock('@prisma/client', () => {
        class PrismaClientMock {
          naveNodriza = {
            findUnique: jest.fn(async ({ where }: any) =>
              where?.id ? { id: where.id, nombre: 'OK' } : null
            ),
          }
          aeronave = {
            create: jest.fn(() => { throw new Error('db write fail') }),
          }
        }
        return { __esModule: true, PrismaClient: PrismaClientMock }
      })
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@/app/api/aeronaves/route')
      POST_AER = mod.POST
    })

    const req = new Request('http://localhost/api/aeronaves', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: 'A_ERR',
        nombre: 'A',
        maximoMarcianos: 1,
        origenId: 'N1',
        destinoId: 'N1',
      }),
    })

    const res = await POST_AER!(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(typeof body.error).toBe('string')
  })

  afterAll(() => mute.mockRestore())
})
