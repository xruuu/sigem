import { nodrizaSchema, aeronaveSchema } from '@/lib/validations'

describe('Zod validations – casos extra', () => {
  it('nodriza: nombre no puede faltar ni ser vacío', () => {
    expect(() => nodrizaSchema.parse({ id: 'N1', nombre: 'Alpha' })).not.toThrow()
    expect(() => nodrizaSchema.parse({ id: 'N1', nombre: '' } as any)).toThrow()
    expect(() => nodrizaSchema.parse({ id: 'N1' } as any)).toThrow()
  })

  it('aeronave: maximoMarcianos debe ser entero ≥ 0', () => {
    expect(() =>
      aeronaveSchema.parse({ id: 'A0', nombre: 'Zero', maximoMarcianos: 0, origenId: 'N1', destinoId: 'N1' })
    ).not.toThrow()
    expect(() =>
      aeronaveSchema.parse({ id: 'Aneg', nombre: 'Neg', maximoMarcianos: -1, origenId: 'N1', destinoId: 'N2' } as any)
    ).toThrow()
    expect(() =>
      aeronaveSchema.parse({ id: 'Afloat', nombre: 'Float', maximoMarcianos: 3.14, origenId: 'N1', destinoId: 'N2' } as any)
    ).toThrow()
  })

  it('aeronave: ids requeridos y no vacíos', () => {
    expect(() =>
      aeronaveSchema.parse({ id: '', nombre: 'Vacío', maximoMarcianos: 1, origenId: 'N1', destinoId: 'N2' } as any)
    ).toThrow()
    expect(() =>
      aeronaveSchema.parse({ id: 'A1', nombre: 'OK', maximoMarcianos: 1, origenId: '', destinoId: 'N2' } as any)
    ).toThrow()
  })
})
