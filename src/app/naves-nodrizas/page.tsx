'use client';
import { useEffect, useState } from "react";
import { Field } from "@/components/Field";
type Nodriza = { id: string; nombre: string };
export default function NodrizasPage() {
  const [list, setList] = useState<Nodriza[]>([]);
  const [form, setForm] = useState<Nodriza>({ id: "", nombre: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const load = async () => { const res = await fetch("/api/naves-nodrizas"); setList(await res.json()); };
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    const res = await fetch("/api/naves-nodrizas", { method: "POST", body: JSON.stringify(form) });
    if (res.ok) { setForm({ id: "", nombre: "" }); load(); setMsg("Nodriza creada."); }
    else { const { error } = await res.json(); setMsg(error ?? "Error"); }
  };
  return (
    <div className="grid2">
      <div className="card">
        <div className="title">Crear Nodriza</div>
        <form onSubmit={submit}>
          <Field label="Identificador"><input className="input" placeholder="identificador" value={form.id} onChange={e => setForm({...form, id: e.target.value})} /></Field>
          <Field label="Nombre"><input className="input" placeholder="nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></Field>
          <button className="btn" type="submit">Crear</button>
          {msg && <p className="mt-2 text-sm">{msg}</p>}
        </form>
      </div>
      <div className="card">
        <div className="title">Listado</div>
        <ul className="list-disc ml-6">
          {list.length === 0 && <li className="muted">No hay nodrizas.</li>}
          {list.map(n => <li key={n.id}>{n.id} — {n.nombre}</li>)}
        </ul>
      </div>
    </div>
  );
}
