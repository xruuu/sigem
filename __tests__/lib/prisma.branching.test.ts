/** @jest-environment node */

// Cubrimos ambas ramas de lib/prisma.ts (cache global en no-prod y no cache en prod)
const ORIGINAL_ENV = process.env

// Mock de PrismaClient para no abrir conexiones reales
jest.mock('@prisma/client', () => {
  const PrismaClient = jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  }))
  return { PrismaClient }
})

describe('lib/prisma – branching por NODE_ENV', () => {
  beforeEach(() => {
    jest.resetModules()
    // restauramos el objeto completo y limpiamos cache global
    process.env = { ...ORIGINAL_ENV }
    // @ts-ignore
    delete (globalThis as any).prisma
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
    // @ts-ignore
    delete (globalThis as any).prisma
  })

  it('en producción NO guarda el cliente en globalThis', () => {
    // Fuerza segura para TS: any
    ;(process.env as any).NODE_ENV = 'production'

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@/lib/prisma')
      expect(mod).toBeTruthy()
      // @ts-ignore
      expect((globalThis as any).prisma).toBeUndefined()
    })
  })

  it('en no-producción SÍ cachea el cliente en globalThis', () => {
    ;(process.env as any).NODE_ENV = 'test'

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@/lib/prisma')
      expect(mod).toBeTruthy()
      // @ts-ignore
      expect((globalThis as any).prisma).toBeDefined()
    })
  })
})
