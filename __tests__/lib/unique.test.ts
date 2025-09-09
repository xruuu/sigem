/**
 * Tests unitarios de unique(): estabilidad de prefijo y unicidad.
 * Aunque se usa en muchos tests, aquí cubrimos directamente su contrato.
 */
import { unique } from '../api/_helpers'

describe('unique()', () => {
  it('devuelve valores distintos en llamadas consecutivas', () => {
    const a = unique('X')
    const b = unique('X')
    expect(a).not.toBe(b)
  })
  it('respeta el prefijo indicado', () => {
    const p = unique('P')
    expect(p.startsWith('P')).toBe(true)
  })
  it('sin prefijo, devuelve un string no vacío', () => {
    const v = unique()
    expect(typeof v).toBe('string')
    expect(v.length).toBeGreaterThan(0)
  })
})
