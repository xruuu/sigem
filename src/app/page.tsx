export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bienvenido a SIGEM</h1>
      <div className="card">
        <p>Gestiona Nodrizas, Aeronaves, Pasajeros y Revisiones desde el menú superior.</p>
        <ul className="list-disc ml-6 mt-2 text-slate-300">
          <li>Respetando capacidad máxima de aeronaves</li>
          <li>Un pasajero no puede estar en más de una aeronave simultáneamente</li>
          <li>Una revisión por aeronave y día (snapshot de pasajeros)</li>
        </ul>
      </div>
    </div>
  );
}
