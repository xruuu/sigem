/** @jest-environment node */

import { post, unique } from "./_helpers"
import { POST as POST_NOD } from "@/app/api/naves-nodrizas/route"
import { POST as POST_AER } from "@/app/api/aeronaves/route"
import { POST as POST_ASIGNAR } from "@/app/api/pasajeros/asignar/route"
import { POST as POST_PAS } from "@/app/api/pasajeros/route"

describe("Asignaciones – edge cases", () => {
  it("rechaza pasajero/aeronave inexistentes y permite asignar después de crear bien", async () => {
    const suf = unique("S")
    const bad = await POST_ASIGNAR(post("/api/pasajeros/asignar", { pasajeroId: "NOPE", aeronaveId: "NOPE" }))
    expect([400, 404, 422].includes(bad.status)).toBe(true)

    const N = "N1_" + suf
    await POST_NOD(post("/api/naves-nodrizas", { id: N, nombre: "Alpha" }))
    const A = "A1_" + suf
    await POST_AER(post("/api/aeronaves", { id: A, nombre: "A", maximoMarcianos: 2, origenId: N, destinoId: N }))
    const P = "P1_" + suf
    await POST_PAS(post("/api/pasajeros", { id: P, nombre: "Mar Uno" }))

    const ok = await POST_ASIGNAR(post("/api/pasajeros/asignar", { pasajeroId: P, aeronaveId: A }))
    expect([200, 201].includes(ok.status)).toBe(true)
  })
})
