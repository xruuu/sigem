import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";

import { asignarSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const data = asignarSchema.parse(await req.json());
    const [pasajero, aeronave] = await Promise.all([
      prisma.pasajero.findUnique({ where: { id: data.pasajeroId } }),
      prisma.aeronave.findUnique({ where: { id: data.aeronaveId } })
    ]);
    if (!pasajero) return NextResponse.json({ error: "Pasajero no encontrado" }, { status: 404 });
    if (!aeronave) return NextResponse.json({ error: "Aeronave no encontrada" }, { status: 404 });

    const activeInAny = await prisma.pasajeroAeronave.findFirst({
      where: { pasajeroId: data.pasajeroId, fechaBajada: null }
    });
    if (activeInAny) return NextResponse.json({ error: "El pasajero ya está en una aeronave" }, { status: 409 });

    const ocupacion = await prisma.pasajeroAeronave.count({ where: { aeronaveId: data.aeronaveId, fechaBajada: null } });
    if (ocupacion >= aeronave.maximoMarcianos) return NextResponse.json({ error: "Capacidad máxima alcanzada" }, { status: 409 });

    const rec = await prisma.pasajeroAeronave.create({
      data: { pasajeroId: data.pasajeroId, aeronaveId: data.aeronaveId, fechaSubida: new Date(), fechaBajada: null }
    });

    return NextResponse.json(rec, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
