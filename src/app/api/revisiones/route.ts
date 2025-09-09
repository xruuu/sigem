import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";

import { revisionSchema } from "@/lib/validations";

function toDate(dateStr: string) {
  const [y,m,d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m-1, d)); // UTC midnight for uniqueness-by-day
}

export async function GET() {
  const list = await prisma.revision.findMany({
    orderBy: [{ fecha: "desc" }, { id: "asc" }],
    include: { pasajeros: { select: { pasajeroId: true } } }
  });
  const result = list.map(r => ({
    id: r.id, nombreRevisor: r.nombreRevisor, aeronaveId: r.aeronaveId,
    fecha: r.fecha.toISOString().slice(0,10),
    pasajeros: r.pasajeros.map(p => p.pasajeroId)
  }));
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const data = revisionSchema.parse(await req.json());
    const fechaUTC = toDate(data.fecha);

    const exists = await prisma.revision.findFirst({
      where: { aeronaveId: data.aeronaveId, fecha: fechaUTC }
    });
    if (exists) return NextResponse.json({ error: "Ya existe una revisión para esa aeronave en esa fecha" }, { status: 409 });

    const aboard = await prisma.pasajeroAeronave.findMany({
      where: { aeronaveId: data.aeronaveId, fechaBajada: null },
      select: { pasajeroId: true }
    });

    const created = await prisma.revision.create({
      data: {
        id: data.id,
        nombreRevisor: data.nombreRevisor,
        aeronaveId: data.aeronaveId,
        fecha: fechaUTC,
        pasajeros: { create: aboard.map(p => ({ pasajeroId: p.pasajeroId })) }
      }
    });

    return NextResponse.json({ id: created.id, nombreRevisor: data.nombreRevisor, aeronaveId: data.aeronaveId, fecha: data.fecha, pasajeros: aboard.map(p=>p.pasajeroId) }, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
