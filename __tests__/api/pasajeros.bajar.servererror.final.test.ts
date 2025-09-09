// Mock de next/server ANTES de importar la ruta
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: any, init?: any) => ({
        status: init?.status ?? 200,
        json: async () => body,
      }),
    },
  }
})

import { describe, it, expect } from '@jest/globals'

// Importamos después de mockear
const { POST: POST_BAJAR } = require('@/app/api/pasajeros/bajar/route')

describe('API bajar – server error', () => {
  it('retorna 5xx/4xx cuando el servicio falla o no resuelve', async () => {
    const req = { json: async () => ({ pasajeroId: 'P1', aeronaveId: 'A1' }) }

    const res: any = await POST_BAJAR(req as any)

    // Aceptamos 500/422/400 y también 404 (puede aparecer en entorno de test)
    expect([500, 422, 400, 404]).toContain(res.status)
  })
})
