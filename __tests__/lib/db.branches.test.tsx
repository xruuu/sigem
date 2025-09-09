import { prisma } from '@/lib/db'

describe('lib/db – cache del cliente Prisma', () => {
  it('expone una única instancia (cacheada) de prisma', () => {
    // Importar otra vez debe devolver la misma instancia
    // (Jest cachea módulos; comprobamos que es el mismo objeto)
    // @ts-ignore
    const { prisma: prismaAgain } = require('@/lib/db')
    expect(prismaAgain).toBe(prisma)
  })
})
