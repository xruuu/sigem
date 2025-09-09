/** @jest-environment jsdom */

import React from 'react'
import { render, screen } from '@testing-library/react'
import RootLayout from '@/app/layout'

describe('RootLayout', () => {
  it('renderiza los children dentro del layout', () => {
    render(
      <RootLayout>
        <main>Contenido de prueba</main>
      </RootLayout>
    )
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument()
  })
})
