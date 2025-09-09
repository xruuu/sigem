import { puedeSubir } from '@/lib/domain'

describe('Dominio SIGEM – puedeSubir', () => {
  it('true si aforoActual < capacidad; false si igual o mayor', () => {
    expect(puedeSubir(10, 0)).toBe(true)
    expect(puedeSubir(10, 9)).toBe(true)
    expect(puedeSubir(10, 10)).toBe(false)
    expect(puedeSubir(10, 11)).toBe(false)
  })

  it('bordes no estándar: capacidades 0 o negativas se tratan como llenas', () => {
    expect(puedeSubir(0, 0)).toBe(false)
    expect(puedeSubir(-1, 0)).toBe(false)
  })
})
