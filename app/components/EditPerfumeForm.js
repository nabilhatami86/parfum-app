'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/Toast';

export default function EditPerfumeForm({ action, perfume }) {
  const showToast = useToast();
  const [method, setMethod] = useState(perfume.buy_method || 'cash');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await action(formData);
      showToast('Perubahan parfum berhasil disimpan', 'success');
    } catch (err) {
      if (err.message && err.message.includes('NEXT_REDIRECT')) {
        showToast('Perubahan parfum berhasil disimpan', 'success');
        return;
      }
      showToast(err.message || 'Gagal menyimpan perubahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm mb-10" onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={perfume.id} />
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Nama parfum
        <input name="name" defaultValue={perfume.name} required className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Harga beli (Rp)
        <input name="buy_price" type="number" min="0" defaultValue={perfume.buy_price} required className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Target harga jual (Rp)
        <input name="target_price" type="number" min="0" defaultValue={perfume.target_price ?? ''} placeholder="Isi agar potensi untung terlihat" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Kondisi
        <select name="kondisi" defaultValue={perfume.kondisi} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal">
          <option value="segel">Segel</option>
          <option value="tester">Dibuka untuk tes aroma</option>
          <option value="preloved">Preloved</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Dibeli pakai
        <select name="buy_method" value={method} onChange={(e) => setMethod(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal">
          <option value="cash">Cash</option>
          <option value="spaylater">ShopeePayLater</option>
          <option value="tukar_tambah">Tukar tambah</option>
        </select>
      </label>

      {method === 'spaylater' && (
        <>
          <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
            Durasi cicilan
            <select name="installment_months" defaultValue={String(perfume.installment_months || 1)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal">
              <option value="1">1 bulan</option>
              <option value="3">3 bulan</option>
              <option value="6">6 bulan</option>
              <option value="12">12 bulan</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
            Tanggal cicilan pertama
            <input name="due_date" type="date" defaultValue={perfume.due_date ? String(perfume.due_date).slice(0, 10) : ''} required className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
          </label>
        </>
      )}

      <input type="hidden" name="was_debt_paid" value={String(perfume.debt_paid)} />
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Sumber
        <input name="source" defaultValue={perfume.source} placeholder="Shopee, teman, dll" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Tanggal beli
        <input name="bought_at" type="date" defaultValue={perfume.bought_at ? String(perfume.bought_at).slice(0, 10) : ''} required className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
      </label>
      <label className="col-span-full flex flex-col gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
        Keterangan
        <textarea name="notes" rows="2" defaultValue={perfume.notes} placeholder="Ukuran, sisa isi, batch, minus, dll" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-900 font-normal" />
      </label>
      <div className="col-span-full flex items-center gap-4">
        <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer">
          {loading ? 'Menyimpan...' : 'Simpan perubahan'}
        </button>
        <a className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-slate-200 transition-all text-center no-underline text-sm" href="/stok">
          Batal
        </a>
      </div>
    </form>
  );
}
