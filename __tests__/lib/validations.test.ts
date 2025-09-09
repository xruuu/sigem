// __tests__/lib/validations.test.ts
import { aeronaveSchema, nodrizaSchema } from '@/lib/validations';

describe('validaciones básicas', () => {
  it('nodrizaSchema acepta id+nombre válidos', () => {
    const v = nodrizaSchema.parse({ id: 'N1', nombre: 'Alpha' });
    expect(v).toEqual({ id: 'N1', nombre: 'Alpha' });
  });

  it('aeronaveSchema acepta entero >=1 y ids válidos', () => {
    const v = aeronaveSchema.parse({
      id: 'A1', nombre: 'A', maximoMarcianos: 3, origenId: 'N1', destinoId: 'N2'
    });
    expect(v.maximoMarcianos).toBe(3);
  });
});
