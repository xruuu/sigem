export {} // <-- evita que las declaraciones sean globales

// Mock de next/server para que NextResponse.json devuelva un objeto plano y no requiera el runtime Edge
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: { status?: number }) => ({ status: init?.status ?? 200, body }),
  },
}))

// Cargamos el handler después del mock
const { POST: POST_BAJAR } = require('@/app/api/pasajeros/bajar/route')

// Request mínima con .json() para que el handler pueda leer el body
class MiniRequest {
  url: string
  private _init: any
  constructor(url: string, init: any) {
    this.url = url
    this._init = init || {}
  }
  async json() {
    return this._init?.body ? JSON.parse(this._init.body) : {}
  }
  get headers() {
    return this._init?.headers || {}
  }
  get method() {
    return this._init?.method || 'GET'
  }
}

describe('API bajar – ramas extra', () => {
  it('Request mínima no válida ⇒ 400 (ZodError)', async () => {
    const req = new MiniRequest('http://test.local/api/pasajeros/bajar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}), // faltan campos -> ZodError
    })

    const res: any = await POST_BAJAR(req as any)
    expect(res.status).toBe(400)
  })
})
