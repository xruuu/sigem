import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";

import { nodrizaSchema } from "@/lib/validations";

export async function GET() {
  const list = await prisma.naveNodriza.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    const data = nodrizaSchema.parse(await req.json());
    const exists = await prisma.naveNodriza.findUnique({ where: { id: data.id } });
    if (exists) return NextResponse.json({ error: "ID duplicado" }, { status: 409 });
    const created = await prisma.naveNodriza.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
