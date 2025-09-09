// src/components/AeronaveForm.tsx
import React, { useState, FormEvent } from 'react'

type AeronaveFormProps = {
  onCreate?: (data: {
    id: string
    nombre: string
    maximoMarcianos: number
    origenId: string
    destinoId: string
  }) => void
}

export default function AeronaveForm({ onCreate }: AeronaveFormProps) {
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [maximoMarcianos, setMaximoMarcianos] = useState<number | ''>('')
  const [origenId, setOrigenId] = useState('')
  const [destinoId, setDestinoId] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!id || !nombre || !maximoMarcianos || !origenId || !destinoId) return
    onCreate?.({
      id,
      nombre,
      maximoMarcianos: Number(maximoMarcianos),
      origenId,
      destinoId,
    })
    // limpia el formulario (muchos tests esperan este comportamiento)
    setId('')
    setNombre('')
    setMaximoMarcianos('')
    setOrigenId('')
    setDestinoId('')
  }

  return (
    <form onSubmit={onSubmit} aria-label="form-aeronave" className="space-y-4">
      <label className="block">
        <div className="mb-1 text-sm">ID</div>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Identificador de la aeronave"
          aria-label="ID"
          className="border p-2 w-full"
        />
      </label>

      <label className="block">
        <div className="mb-1 text-sm">Nombre</div>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la aeronave"
          aria-label="Nombre"
          className="border p-2 w-full"
        />
      </label>

      <label className="block">
        <div className="mb-1 text-sm">Máximo pasajeros</div>
        <input
          type="number"
          value={maximoMarcianos}
          onChange={(e) => setMaximoMarcianos(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Capacidad máxima"
          aria-label="Máximo pasajeros"
          className="border p-2 w-full"
          min={0}
        />
      </label>

      <label className="block">
        <div className="mb-1 text-sm">Nodriza origen</div>
        <input
          value={origenId}
          onChange={(e) => setOrigenId(e.target.value)}
          placeholder="ID nodriza origen"
          aria-label="Nodriza origen"
          className="border p-2 w-full"
        />
      </label>

      <label className="block">
        <div className="mb-1 text-sm">Nodriza destino</div>
        <input
          value={destinoId}
          onChange={(e) => setDestinoId(e.target.value)}
          placeholder="ID nodriza destino"
          aria-label="Nodriza destino"
          className="border p-2 w-full"
        />
      </label>

      <button type="submit" className="px-4 py-2 border">
        Crear aeronave
      </button>
    </form>
  )
}
