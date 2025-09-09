import { nodrizaSchema, aeronaveSchema } from '@/lib/validations'

describe('validaciones de dominio (Zod)', () => {
  test('nodrizaSchema: requiere id y nombre', () => {
    expect(() => nodrizaSchema.parse({ id: 'N1', nombre: 'Alpha' })).not.toThrow()
    expect(() => nodrizaSchema.parse({ id: 'N1' })).toThrow()
    expect(() => nodrizaSchema.parse({ nombre: 'Alpha' })).toThrow()
  })

  test('aeronaveSchema: requiere id, nombre, maximoMarcianos, origenId y destinoId', () => {
    expect(() =>
      aeronaveSchema.parse({
        id: 'A1',
        nombre: 'Ares-1',
        maximoMarcianos: 10,
        origenId: 'N1',
        destinoId: 'N2',
      })
    ).not.toThrow()

    // faltan campos
    expect(() =>
      aeronaveSchema.parse({
        id: 'A1',
        nombre: 'Ares-1',
        origenId: 'N1',
        destinoId: 'N2',
      } as any)
    ).toThrow()
  })
})
