// __tests__/setup/request-polyfill.ts
(() => {
  const g: any = globalThis as any
  if (g.Request && g.Response && g.Headers && g.fetch && typeof g.Response.json === 'function') return

  let fetchFn: any, HeadersCtor: any, RequestCtor: any, ResponseCtor: any

  try {
    // Preferir undici si está instalado
    const undici = require('undici')
    fetchFn = undici.fetch
    HeadersCtor = undici.Headers
    RequestCtor = undici.Request
    ResponseCtor = undici.Response
  } catch {
    // Fallback a cross-fetch (no aporta Response.json estático)
    const cf = require('cross-fetch')
    fetchFn = cf.fetch || cf
    HeadersCtor = cf.Headers
    RequestCtor = cf.Request
    ResponseCtor = cf.Response
  }

  g.fetch = g.fetch || fetchFn
  g.Headers = g.Headers || HeadersCtor
  g.Request = g.Request || RequestCtor
  g.Response = g.Response || ResponseCtor

  // --- SHIMS para APIs estáticas faltantes ---
  if (g.Response && typeof g.Response.json !== 'function') {
    g.Response.json = (data: any, init?: ResponseInit) => {
      const headers = new g.Headers(init?.headers || {})
      if (!headers.has('content-type')) headers.set('content-type', 'application/json; charset=utf-8')
      return new g.Response(JSON.stringify(data), { ...init, headers })
    }
  }
  if (g.Response && typeof g.Response.redirect !== 'function') {
    g.Response.redirect = (url: string, status = 302) =>
      new g.Response(null, { status, headers: { location: url } })
  }
})()
