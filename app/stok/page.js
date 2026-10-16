import { sql, init, rp, kondisiLabel } from '@/lib/db';
import Link from 'next/link';
import { addPerfume, deletePerfume, markAsTester } from '../actions';
import AddPerfumeForm from '@/app/components/AddPerfumeForm';
import { MarkTesterButton, DeletePerfumeButton } from '@/app/components/PerfumeTableActions';

export const dynamic = 'force-dynamic';

export default async function Stok() {
  await init();
  const rows = await sql`SELECT * FROM perfumes ORDER BY sold, id DESC`;
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Tambah Parfum</h1>
      <AddPerfumeForm action={addPerfume} />

      <h2 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-indigo-600 pl-3">Daftar Seluruh Parfum</h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Kondisi</th>
                <th className="px-6 py-4">Harga beli</th>
                <th className="px-6 py-4">Target jual</th>
                <th className="px-6 py-4">Potensi</th>
                <th className="px-6 py-4">Bayar</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4">{kondisiLabel(p.kondisi)}</td>
                  <td className="px-6 py-4">{rp(p.buy_price)}</td>
                  <td className="px-6 py-4">{p.target_price == null ? '-' : rp(p.target_price)}</td>
                  <td className={`px-6 py-4 font-bold ${p.target_price != null && p.target_price - p.buy_price < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {p.target_price == null ? '-' : rp(p.target_price - p.buy_price)}
                  </td>
                  <td className="px-6 py-4">
                    {p.buy_method}
                    {p.buy_method === 'spaylater' && (
                      <span className="block text-xs text-slate-400">
                        {p.installment_months || 1}x {rp(Math.ceil(p.buy_price / (p.installment_months || 1)))} ({p.paid_installments || 0}/{p.installment_months || 1} lunas)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{p.notes || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${p.sold ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {p.sold ? 'Terjual' : 'Stok'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all no-underline" href={`/stok/${p.id}/edit`}>Edit</Link>
                      {!p.sold && p.kondisi === 'segel' && <MarkTesterButton action={markAsTester} id={p.id} name={p.name} />}
                      {!p.sold && <DeletePerfumeButton action={deletePerfume} id={p.id} name={p.name} />}
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan="9" className="px-6 py-8 text-center text-slate-400">Belum ada data parfum.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
