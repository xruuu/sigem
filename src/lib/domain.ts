export function puedeSubir(capacidadMaxima: number, aforoActual: number): boolean {
  // política simple: capacidad <= 0 => no sube nadie
  if (capacidadMaxima <= 0) return false
  return aforoActual < capacidadMaxima
}
