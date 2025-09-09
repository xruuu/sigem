import '../setup/request-polyfill'

describe('POST /api/naves-nodrizas – error 500 genérico', () => {
  const mute = jest.spyOn(console, 'log').mockImplementation(() => {})

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('si Prisma lanza error genérico → 500 y JSON', async () => {
    let POST_NOD: (req: Request) => Promise<Response>

    jest.isolateModules(() => {
      jest.doMock('@prisma/client', () => {
        class PrismaClientMock {
          naveNodriza = {
            create: jest.fn(() => { throw new Error('db broken') }),
            findMany: jest.fn(async () => []),
          }
        }
        return { __esModule: true, PrismaClient: PrismaClientMock }
      })
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@/app/api/naves-nodrizas/route')
      POST_NOD = mod.POST
    })

    const req = new Request('http://localhost/api/naves-nodrizas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'N_ERR', nombre: 'Alpha' }),
    })

    const res = await POST_NOD!(req)
    expect(res.status).toBe(500)
    expect((res.headers.get('content-type') || '').toLowerCase()).toContain('application/json')
    const body = await res.json()
    expect(body?.error).toBeTruthy()
  })

  afterAll(() => mute.mockRestore())
})
