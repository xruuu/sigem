'use client';
import { useEffect, useState } from "react";
import { Field } from "@/components/Field";

type Revision = { id: string; nombreRevisor: string; aeronaveId: string; fecha: string; pasajeros: string[] };
type Aeronave = { id: string; nombre: string };

const today = new Date().toISOString().slice(0,10);

export default function RevisionesPage() {
  const [list, setList] = useState<Revision[]>([]);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [form, setForm] = useState<Revision>({ id: "", nombreRevisor: "", aeronaveId: "", fecha: today, pasajeros: [] });
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setList(await (await fetch("/api/revisiones")).json());
    setAeronaves(await (await fetch("/api/aeronaves")).json());
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/revisiones", { method: "POST", body: JSON.stringify(form) });
    const j = await res.json();
    if (res.ok) { setForm({ id:"", nombreRevisor:"", aeronaveId:"", fecha: today, pasajeros: [] }); load(); setMsg("Revisión creada."); }
    else { setMsg(j.error ?? "Error"); }
  };

  return (
    <div className="grid2">
      <div className="card">
        <div className="title">Crear Revisión</div>
        <form onSubmit={submit}>
          <Field label="Identificador"><input className="input" placeholder="identificador" value={form.id} onChange={e=>setForm({...form, id:e.target.value})} /></Field>
          <Field label="Nombre del revisor"><input className="input" placeholder="nombre del revisor" value={form.nombreRevisor} onChange={e=>setForm({...form, nombreRevisor:e.target.value})} /></Field>
          <Field label="Aeronave">
            <select className="select" value={form.aeronaveId} onChange={e=>setForm({...form, aeronaveId:e.target.value})}>
              <option value="">—</option>
              {aeronaves.map(a=> <option key={a.id} value={a.id}>{a.nombre} ({a.id})</option>)}
            </select>
          </Field>
          <Field label="Fecha"><input type="date" className="input" value={form.fecha} onChange={e=>setForm({...form, fecha:e.target.value})} /></Field>
          <button className="btn" type="submit">Guardar</button>
          {msg && <p className="mt-2 text-sm">{msg}</p>}
        </form>
      </div>
      <div className="card">
        <div className="title">Histórico</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-300">
              <tr><th className="text-left p-2">ID</th><th className="text-left p-2">Revisor</th><th className="text-left p-2">Aeronave</th><th className="text-left p-2">Fecha</th><th className="text-left p-2">Pasajeros (IDs)</th></tr>
            </thead>
            <tbody>
              {list.length===0 && <tr><td className="p-2 muted" colSpan={5}>No hay revisiones.</td></tr>}
              {list.map(r=> (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.nombreRevisor}</td>
                  <td className="p-2">{r.aeronaveId}</td>
                  <td className="p-2">{r.fecha}</td>
                  <td className="p-2">{r.pasajeros.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
