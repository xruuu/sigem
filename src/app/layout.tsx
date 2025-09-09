export const metadata = { title: "SIGEM", description: "Sistema de Gestión de Naves Marcianas" };
import Link from "next/link";
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-slate-800">
          <nav className="mx-auto max-w-5xl px-4 py-4 flex gap-4">
            <Link href="/" className="text-lg font-semibold text-sky-300">SIGEM</Link>
            <Link href="/naves-nodrizas" className="hover:underline">Nodrizas</Link>
            <Link href="/aeronaves" className="hover:underline">Aeronaves</Link>
            <Link href="/pasajeros" className="hover:underline">Pasajeros</Link>
            <Link href="/revisiones" className="hover:underline">Revisiones</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
