'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/Toast';

export default function SellPerfumeForm({ action, stok }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await action(formData);
      showToast('Penjualan berhasil dicatat!', 'success');
      form.reset();
    } catch (err) {
      if (err.message && err.message.includes('NEXT_REDIRECT')) {
        showToast('Penjualan berhasil dicatat!', 'success');
        return;
      }
      showToast(err.message || 'Gagal mencatat penjualan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm mb-10" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Parfum yang dijual
        <select name="perfume_id" required className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal">
          <option value="">-- Pilih Parfum Stok --</option>
          {stok.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.kondisi}, modal Rp {p.buy_price.toLocaleString('id-ID')})
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Pembeli
        <input name="customer" placeholder="Nama pembeli / toko" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Uang yang diterima (Rp)
        <input name="cash_in" type="number" min="0" defaultValue="0" required className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
      </label>
      
      <fieldset className="col-span-full border border-slate-200 bg-slate-50/50 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <legend className="font-bold text-slate-800 bg-white px-4 py-1.5 border border-slate-200 rounded-xl text-xs uppercase tracking-wider">
          Tukar tambah (opsional): parfum dari pembeli
        </legend>
        <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
          Nama parfum TT
          <input name="ti_name" placeholder="Nama parfum tukar tambah" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
        </label>
        <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
          Nilai TT (Rp)
          <input name="ti_value" type="number" min="0" placeholder="0" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
        </label>
        <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
          Kondisi
          <select name="ti_kondisi" defaultValue="preloved" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal">
            <option value="preloved">Preloved</option>
            <option value="tester">Dibuka untuk tes aroma</option>
            <option value="segel">Segel</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
          Keterangan
          <input name="ti_notes" placeholder="Minus, sisa isi, dll" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
        </label>
      </fieldset>

      <button className="col-span-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-2" type="submit" disabled={loading}>
        {loading ? 'Menyimpan Penjualan...' : 'Simpan penjualan'}
      </button>
    </form>
  );
}
