import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";

import { aeronaveSchema } from "@/lib/validations";

export async function GET() {
  const list = await prisma.aeronave.findMany({
    orderBy: { id: "asc" },
    include: { pasajeros: { where: { fechaBajada: null }, select: { id: true } } }
  });
  const withCount = list.map(a => ({
    id: a.id, nombre: a.nombre, maximoMarcianos: a.maximoMarcianos,
    origenId: a.origenId, destinoId: a.destinoId, ocupacion: a.pasajeros.length
  }));
  return NextResponse.json(withCount);
}

export async function POST(req: Request) {
  try {
    const data = aeronaveSchema.parse(await req.json());
    const nodrizas = await prisma.naveNodriza.count();
    if (nodrizas === 0) return NextResponse.json({ error: "Debe existir al menos una nodriza" }, { status: 400 });
    const exists = await prisma.aeronave.findUnique({ where: { id: data.id } });
    if (exists) return NextResponse.json({ error: "ID duplicado" }, { status: 409 });
    const [o, d] = await Promise.all([
      prisma.naveNodriza.findUnique({ where: { id: data.origenId } }),
      prisma.naveNodriza.findUnique({ where: { id: data.destinoId } })
    ]);
    if (!o || !d) return NextResponse.json({ error: "Nodriza origen/destino no existe" }, { status: 404 });
    const created = await prisma.aeronave.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
