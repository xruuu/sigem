/**
 * Test de página de Aeronaves (Client Component):
 * - Renderiza con RTL (no invocar la función).
 * - Mockea fetch para evitar salidas a red.
 */
import React from 'react'
import { render } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

beforeEach(() => {
  // Mock genérico de fetch que devuelven listas vacías en JSON
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => [],
  })) as any
})

afterEach(() => {
  ;(global.fetch as any)?.mockClear?.()
})

describe('Página Aeronaves', () => {
  it('se renderiza sin explotar', async () => {
    const Page = (await import('@/app/aeronaves/page')).default
    const { container } = render(<Page />)
    expect(container).toBeTruthy()
  })
})
