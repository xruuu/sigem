// __tests__/api/_helpers.ts

// Normaliza URLs relativas (Node requiere absolutas)
const ABS = (u: string) =>
  u?.startsWith('http') ? u : `http://localhost${u?.startsWith('/') ? '' : '/'}${u ?? ''}`

// Genera sufijos únicos y legibles para IDs en tests
export const unique = (prefix = '') =>
  `${prefix}${Date.now()}_${Math.floor(Math.random() * 1e6)}`

// Factories Request para tests de rutas Next.js
export const post = (url: string, body: any) =>
  new Request(ABS(url), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

export const get = (url: string) =>
  new Request(ABS(url), { method: 'GET' })

// Helper pequeño para simular Date ISO (por si lo necesitas)
export const iso = (d = new Date()) =>
  d.toISOString().slice(0, 10)
