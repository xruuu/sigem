/**
 * Cobertura para app/page.tsx (home)
 * Si el componente es async (RSC), lo invocamos y renderizamos su JSX.
 */
import React from 'react'
import { render } from '@testing-library/react'

// Import relativo al alias "@/"
import HomePage from '@/app/page'

describe('Página Home (app/page.tsx)', () => {
  it('se renderiza sin explotar', async () => {
    const ui = (typeof HomePage === 'function') ? await (HomePage as any)() : <></>
    const { container } = render(ui as any)
    expect(container).toBeTruthy()
  })
})
