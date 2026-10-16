import { sql, init } from '@/lib/db';
import { sellPerfume } from '../actions';
import SellPerfumeForm from '@/app/components/SellPerfumeForm';
export const dynamic = 'force-dynamic';

export default async function Jual() {
  await init();
  const stok = await sql`SELECT id, name, kondisi, buy_price FROM perfumes WHERE NOT sold ORDER BY name`;
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Catat Penjualan Parfum</h1>
      <SellPerfumeForm action={sellPerfume} stok={stok} />
    </div>
  );
}
