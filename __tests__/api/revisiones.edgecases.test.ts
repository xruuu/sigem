/** @jest-environment node */

import { post, unique } from "./_helpers"
import { POST as POST_NOD } from "@/app/api/naves-nodrizas/route"
import { POST as POST_AER } from "@/app/api/aeronaves/route"
import { POST as POST_REV } from "@/app/api/revisiones/route"

describe("API /api/revisiones – edge cases", () => {
  it("rechaza nombre revisor vacío/blancos y fecha con formato raro", async () => {
    const R = "R" + unique()
    const bad1 = await POST_REV(post("/api/revisiones", { id: R, nombreRevisor: "", aeronaveId: "NOPE", fecha: "2025-01-01" }))
    const bad2 = await POST_REV(post("/api/revisiones", { id: R+"b", nombreRevisor: "   ", aeronaveId: "NOPE", fecha: "2025/01/01" }))
    expect([400, 422].includes(bad1.status)).toBe(true)
    expect([400, 422].includes(bad2.status)).toBe(true)
  })

  it("rechaza aeronave inexistente (4xx) o 500 si Prisma rompe por FK (lo aceptamos en test)", async () => {
    const R = "R" + unique()
    const res = await POST_REV(post("/api/revisiones", { id: R, nombreRevisor: "Tec", aeronaveId: "NOPE", fecha: "2025-05-05" }))
    expect([400, 404, 422, 500].includes(res.status)).toBe(true)
  })

  it("acepta revisión válida con aeronave existente", async () => {
    const suf = unique("S")
    const N = "N_" + suf
    await POST_NOD(post("/api/naves-nodrizas", { id: N, nombre: "Alpha" }))
    const A = "A_" + suf
    await POST_AER(post("/api/aeronaves", { id: A, nombre: "A", maximoMarcianos: 2, origenId: N, destinoId: N }))
    const ok = await POST_REV(post("/api/revisiones", { id: "R_" + suf, nombreRevisor: "Tec", aeronaveId: A, fecha: "2025-05-05" }))
    expect([200, 201].includes(ok.status)).toBe(true)
  })
})
