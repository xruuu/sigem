'use client';
import { useEffect, useState } from "react";
import { Field } from "@/components/Field";
type Pasajero = { id: string; nombre: string };
type Aeronave = { id: string; nombre: string; maximoMarcianos: number; origenId: string; destinoId: string };
export default function PasajerosPage() {
  const [list, setList] = useState<Pasajero[]>([]);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [form, setForm] = useState<Pasajero>({ id: "", nombre: "" });
  const [asig, setAsig] = useState({ pasajeroId: "", aeronaveId: "" });
  const [bajar, setBajar] = useState({ pasajeroId: "", aeronaveId: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const load = async () => {
    setList(await (await fetch("/api/pasajeros")).json());
    setAeronaves(await (await fetch("/api/aeronaves")).json());
  };
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    const res = await fetch("/api/pasajeros", { method: "POST", body: JSON.stringify(form) });
    if (res.ok) { setForm({ id:"", nombre:"" }); load(); setMsg("Pasajero creado."); } 
    else { const { error } = await res.json(); setMsg(error ?? "Error"); }
  };
  const asignar = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    const res = await fetch("/api/pasajeros/asignar", { method: "POST", body: JSON.stringify(asig) });
    const j = await res.json(); if (res.ok) { load(); setMsg("Pasajero asignado."); } else { setMsg(j.error ?? "Error"); }
  };
  const bajarFn = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null);
    const res = await fetch("/api/pasajeros/bajar", { method: "POST", body: JSON.stringify(bajar) });
    const j = await res.json(); if (res.ok) { load(); setMsg("Pasajero bajado."); } else { setMsg(j.error ?? "Error"); }
  };
  return (
    <div className="space-y-6">
      <div className="grid2">
        <div className="card">
          <div className="title">Alta Pasajero</div>
          <form onSubmit={submit}>
            <Field label="Identificador"><input className="input" placeholder="identificador" value={form.id} onChange={e=>setForm({...form, id:e.target.value})}/></Field>
            <Field label="Nombre"><input className="input" placeholder="nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}/></Field>
            <button className="btn" type="submit">Crear</button>
          </form>
        </div>
        <div className="card">
          <div className="title">Asignar Pasajero</div>
          <form onSubmit={asignar}>
            <Field label="Pasajero">
              <select className="select" value={asig.pasajeroId} onChange={e=>setAsig({...asig, pasajeroId:e.target.value})}>
                <option value="">—</option>
                {list.map(p=> <option key={p.id} value={p.id}>{p.nombre} ({p.id})</option>)}
              </select>
            </Field>
            <Field label="Aeronave">
              <select className="select" value={asig.aeronaveId} onChange={e=>setAsig({...asig, aeronaveId:e.target.value})}>
                <option value="">—</option>
                {aeronaves.map(a=> <option key={a.id} value={a.id}>{a.nombre} ({a.id})</option>)}
              </select>
            </Field>
            <button className="btn" type="submit">Asignar</button>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="title">Bajar Pasajero</div>
        <form onSubmit={bajarFn} className="grid2">
          <Field label="Pasajero">
            <select className="select" value={bajar.pasajeroId} onChange={e=>setBajar({...bajar, pasajeroId:e.target.value})}>
              <option value="">—</option>
              {list.map(p=> <option key={p.id} value={p.id}>{p.nombre} ({p.id})</option>)}
            </select>
          </Field>
          <Field label="Aeronave">
            <select className="select" value={bajar.aeronaveId} onChange={e=>setBajar({...bajar, aeronaveId:e.target.value})}>
              <option value="">—</option>
              {aeronaves.map(a=> <option key={a.id} value={a.id}>{a.nombre} ({a.id})</option>)}
            </select>
          </Field>
          <button className="btn" type="submit">Bajar</button>
        </form>
      </div>
      <div className="card">
        <div className="title">Listado Pasajeros</div>
        <ul className="list-disc ml-6">
          {list.length===0 && <li className="muted">No hay pasajeros.</li>}
          {list.map(p=> <li key={p.id}>{p.id} — {p.nombre}</li>)}
        </ul>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
