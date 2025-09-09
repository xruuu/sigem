'use client';
import { useEffect, useState } from "react";
import { Field } from "@/components/Field";
type Nodriza = { id: string; nombre: string };
type Aeronave = { id: string; nombre: string; maximoMarcianos: number; origenId: string; destinoId: string };
type AeronaveList = Aeronave & { ocupacion: number };
export default function AeronavesPage() {
  const [nodrizas, setNodrizas] = useState<Nodriza[]>([]);
  const [list, setList] = useState<AeronaveList[]>([]);
  const [form, setForm] = useState<Aeronave>({ id: "", nombre: "", maximoMarcianos: 0, origenId: "", destinoId: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const load = async () => {
    const n = await (await fetch("/api/naves-nodrizas")).json(); setNodrizas(n);
    const a = await (await fetch("/api/aeronaves")).json(); setList(a);
    if (!form.origenId && n[0]) setForm(f => ({...f, origenId: n[0].id, destinoId: n[0].id}));
  };
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    const res = await fetch("/api/aeronaves", { method: "POST", body: JSON.stringify(form) });
    if (res.ok) { setForm({ id:"", nombre:"", maximoMarcianos:0, origenId: nodrizas[0]?.id ?? "", destinoId: nodrizas[0]?.id ?? "" }); load(); setMsg("Aeronave creada."); }
    else { const { error } = await res.json(); setMsg(error ?? "Error"); }
  };
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="title">Crear Aeronave</div>
        <form onSubmit={submit} className="grid2">
          <div>
            <Field label="Identificador"><input className="input" placeholder="identificador" value={form.id} onChange={e => setForm({...form, id: e.target.value})} /></Field>
            <Field label="Nombre"><input className="input" placeholder="nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></Field>
            <Field label="Máximo de pasajeros"><input type="number" className="input" placeholder="máximo de pasajeros" value={form.maximoMarcianos} onChange={e => setForm({...form, maximoMarcianos: Number(e.target.value)})} /></Field>
          </div>
          <div>
            <Field label="Nodriza Origen">
              <select className="select" value={form.origenId} onChange={e => setForm({...form, origenId: e.target.value})}>
                {nodrizas.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </Field>
            <Field label="Nodriza Destino">
              <select className="select" value={form.destinoId} onChange={e => setForm({...form, destinoId: e.target.value})}>
                {nodrizas.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            </Field>
            <button className="btn mt-6" type="submit">Crear</button>
            {msg && <p className="mt-2 text-sm">{msg}</p>}
          </div>
        </form>
      </div>
      <div className="card">
        <div className="title">Aeronaves</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-300"><tr><th className="text-left p-2">ID</th><th className="text-left p-2">Nombre</th><th className="text-left p-2">Origen</th><th className="text-left p-2">Destino</th><th className="text-left p-2">Ocupación</th><th className="text-left p-2">Máx</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td className="p-2 muted" colSpan={6}>No hay aeronaves.</td></tr>}
              {list.map(a => (
                <tr key={a.id} className="border-t border-slate-800">
                  <td className="p-2">{a.id}</td>
                  <td className="p-2">{a.nombre}</td>
                  <td className="p-2">{nodrizas.find(n=>n.id===a.origenId)?.nombre ?? a.origenId}</td>
                  <td className="p-2">{nodrizas.find(n=>n.id===a.destinoId)?.nombre ?? a.destinoId}</td>
                  <td className="p-2">{a.ocupacion}</td>
                  <td className="p-2">{a.maximoMarcianos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
