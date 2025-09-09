import { nodrizaSchema, aeronaveSchema } from '@/lib/validations'

describe('validaciones Zod – casos límite', () => {
  describe('nodrizaSchema', () => {
    it('rechaza id vacío', () => {
      expect(() => nodrizaSchema.parse({ id: '', nombre: 'Alpha' })).toThrow()
    })

    it('rechaza nombre vacío', () => {
      expect(() => nodrizaSchema.parse({ id: 'N1', nombre: '' })).toThrow()
    })

    it('permite espacios si el esquema no hace trim explícito', () => {
      // Estos NO deben lanzar con el esquema actual (sin .trim())
      expect(() => nodrizaSchema.parse({ id: '   ', nombre: 'Alpha' })).not.toThrow()
      expect(() => nodrizaSchema.parse({ id: 'N1', nombre: '   ' })).not.toThrow()
    })
  })

  describe('aeronaveSchema', () => {
    it('acepta 0 si el schema lo admite y rechaza negativos/tipos inválidos', () => {
      const base = { id: 'A1', nombre: 'A', origenId: 'N1', destinoId: 'N2' }

      // Con tu schema actual, 0 es válido → no debe lanzar
      expect(() => aeronaveSchema.parse({ ...base, maximoMarcianos: 0 })).not.toThrow()

      // Debe seguir rechazando negativos o tipos incorrectos
      expect(() => aeronaveSchema.parse({ ...base, maximoMarcianos: -1 })).toThrow()
      expect(() => aeronaveSchema.parse({ ...base, maximoMarcianos: '3' as any })).toThrow()
    })
  })
})
