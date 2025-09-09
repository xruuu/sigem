/**
 * Test de página de Revisiones (Client Component):
 * - Renderizar con RTL.
 * - Mock de fetch.
 */
import React from 'react'
import { render } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

beforeEach(() => {
  global.fetch = jest.fn(async (url: any) => {
    // Si tu página pide aeronaves/pasajeros, devolvemos lista vacía igual.
    return {
      ok: true,
      json: async () => [],
    }
  }) as any
})

afterEach(() => {
  ;(global.fetch as any)?.mockClear?.()
})

describe('Página Revisiones', () => {
  it('se renderiza sin explotar', async () => {
    const Page = (await import('@/app/revisiones/page')).default
    const { container } = render(<Page />)
    expect(container).toBeTruthy()
  })
})
