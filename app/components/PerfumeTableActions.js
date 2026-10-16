'use client';

import { useToast } from '@/app/components/Toast';
import { useState } from 'react';

export function PayDebtButton({ action, id, name, paid, total }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    const nextPaid = paid + 1;
    const msg = nextPaid >= total 
      ? `Tandai cicilan ke-${nextPaid} (LUNAS SEMUA) untuk "${name}"?`
      : `Catat pembayaran cicilan ke-${nextPaid} dari ${total} untuk "${name}"?`;
    
    if (!confirm(msg)) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('id', id);
      await action(fd);
      showToast(`Cicilan "${name}" berhasil diperbarui (${nextPaid}/${total})`, 'success');
    } catch (err) {
      showToast('Gagal memperbarui status cicilan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = paid >= total;

  return (
    <form onSubmit={handlePay} style={{ display: 'inline', margin: 0 }}>
      <button 
        type="submit" 
        disabled={loading || isComplete} 
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
          isComplete 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {loading ? 'Memproses...' : isComplete ? 'Lunas' : `Bayar Cicilan (${paid + 1}/${total})`}
      </button>
    </form>
  );
}

export function MarkTesterButton({ action, id, name }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  const handleTester = async (e) => {
    e.preventDefault();
    if (!confirm(`Ubah kondisi "${name}" menjadi tester?`)) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('id', id);
      await action(fd);
      showToast(`Parfum "${name}" diubah menjadi tester`, 'success');
    } catch (err) {
      showToast('Gagal mengubah status parfum', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTester} style={{ display: 'inline', margin: 0 }}>
      <button className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all" type="submit" disabled={loading}>
        {loading ? 'Memproses...' : 'Tes aroma'}
      </button>
    </form>
  );
}

export function DeletePerfumeButton({ action, id, name }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm(`Yakin ingin menghapus "${name}"?`)) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('id', id);
      await action(fd);
      showToast(`Parfum "${name}" berhasil dihapus`, 'success');
    } catch (err) {
      showToast('Gagal menghapus parfum (mungkin sudah terjual)', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDelete} style={{ display: 'inline', margin: 0 }}>
      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all" type="submit" disabled={loading}>
        {loading ? 'Menghapus...' : 'Hapus'}
      </button>
    </form>
  );
}
