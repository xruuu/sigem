import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";

import { bajarSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const data = bajarSchema.parse(await req.json());
    const assignment = await prisma.pasajeroAeronave.findFirst({
      where: { pasajeroId: data.pasajeroId, aeronaveId: data.aeronaveId, fechaBajada: null }
    });
    if (!assignment) return NextResponse.json({ error: "El pasajero no está asignado a esa aeronave" }, { status: 404 });

    const updated = await prisma.pasajeroAeronave.update({
      where: { id: assignment.id },
      data: { fechaBajada: new Date() }
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
