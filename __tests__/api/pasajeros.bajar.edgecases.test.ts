/** @jest-environment node */

import { NextRequest } from 'next/server'
import { POST as POST_BAJAR } from '@/app/api/pasajeros/bajar/route'

const post = (url: string, body: any) =>
  new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })

describe('POST /api/pasajeros/bajar – edge cases', () => {
  it('con body inválido devuelve 400/422 y JSON de error', async () => {
    const res = await POST_BAJAR(post('http://localhost/api/pasajeros/bajar', {}))
    expect([400, 422].includes(res.status)).toBe(true)
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    expect(ct).toContain('application/json')
    const body = await res.json()
    expect(typeof body?.error).toBe('string')
  })
})
