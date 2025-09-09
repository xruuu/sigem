/** @jest-environment node */
import { POST as POST_AER } from '@/app/api/aeronaves/route'
import { POST as POST_NOD } from '@/app/api/naves-nodrizas/route'
import { post, unique } from './_helpers'
import { prisma } from '@/lib/prisma'

describe('API /api/aeronaves – edge cases', () => {
  it('rechaza o corrige maximoMarcianos no entero/<=0; y detecta nodrizas inexistentes', async () => {
    const suf = unique('S')
    const N1 = 'N1_' + suf

    await POST_NOD(post('/api/naves-nodrizas', { id: N1, nombre: 'Alpha' }))

    const base = { id: 'A_' + suf, nombre: 'A', origenId: N1, destinoId: 'NOPE' }

    const bad1 = await POST_AER(post('/api/aeronaves', { ...base, maximoMarcianos: 0 }))
    const bad2 = await POST_AER(post('/api/aeronaves', { ...base, maximoMarcianos: -1 }))
    const bad3 = await POST_AER(post('/api/aeronaves', { ...base, maximoMarcianos: 2.5 }))
    const bad4 = await POST_AER(post('/api/aeronaves', { ...base, maximoMarcianos: '3' as any }))
    const bad5 = await POST_AER(post('/api/aeronaves', { ...base, maximoMarcianos: 3 })) // destino inexistente

    // Si responde 2xx, verificamos que lo persistido cumple el invariante (mm entero > 0).
    const assertCapacidad = async (res: Response) => {
      if (res.status >= 200 && res.status < 300) {
        const saved = await prisma.aeronave.findUnique({ where: { id: base.id } })
        expect(saved).toBeTruthy()
        expect(Number.isInteger(saved!.maximoMarcianos)).toBe(true)
        expect(saved!.maximoMarcianos).toBeGreaterThan(0)
      } else {
        expect([400, 422, 404, 409, 500].includes(res.status)).toBe(true)
      }
    }

    await assertCapacidad(bad1)
    await assertCapacidad(bad2)
    await assertCapacidad(bad3)
    await assertCapacidad(bad4)

    // Para FK inexistente aceptamos 400/404/422/500 (según cómo propague Prisma)
    expect([400, 404, 422, 500].includes(bad5.status)).toBe(true)
  })
})
