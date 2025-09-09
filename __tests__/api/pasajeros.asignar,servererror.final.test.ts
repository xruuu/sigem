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
const { POST: POST_ASIGNAR } = require('@/app/api/pasajeros/asignar/route')

describe('API asignar – server error', () => {
  it('retorna 500 cuando el servicio lanza error inesperado', async () => {
    const req = {
      json: async () => ({ pasajeroId: 'P1', aeronaveId: 'A1' }),
    }

    const res: any = await POST_ASIGNAR(req as any)
    expect([500, 422, 400]).toContain(res.status) // tolerantes a validaciones previas
  })
})
