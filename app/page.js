import { sql, init, rp, kondisiLabel } from '@/lib/db';
import { payDebt } from './actions';
import { PayDebtButton } from '@/app/components/PerfumeTableActions';
import MonthlyChart from '@/app/components/MonthlyChart';
import { 
  PlusCircle, 
  Wallet, 
  TrendingUp, 
  Package, 
  CreditCard, 
  Calendar, 
  Percent, 
  DollarSign, 
  ShoppingCart, 
  BarChart2, 
  Tag, 
  Award
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const dateFromDatabase = (value) => {
  if (!value) return null;
  const iso = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  const [year, month, day] = iso.split('-').map(Number);
  return Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day)
    ? new Date(year, month - 1, day) : null;
};

const addMonths = (date, amount) => {
  const year = date.getFullYear();
  const month = date.getMonth() + amount;
  const day = Math.min(date.getDate(), new Date(year, month + 1, 0).getDate());
  return new Date(year, month, day);
};

const installmentAmount = (total, months, installmentIndex) => {
  const base = Math.floor(total / months);
  return installmentIndex === months - 1 ? total - base * (months - 1) : base;
};

export default async function Dashboard() {
  await init();
  
  let t = { rev: 0, modal: 0, n: 0 };
  let stok = { n: 0, val: 0 };
  let keuangan = { masuk_tunai: 0, pengeluaran_dibayar: 0 };
  let hutang = [];
  let bulanan = [];
  let kondisi = [];
  let top = [];
  let rugi = [];
  let penjualan = [];
  let potensiStok = [];

  try {
    const salesRes = await sql`SELECT COALESCE(SUM(s.sell_price),0)::int rev, COALESCE(SUM(p.buy_price),0)::int modal, COUNT(*)::int n
      FROM sales s JOIN perfumes p ON p.id = s.perfume_id`;
    if (salesRes && salesRes[0]) t = salesRes[0];
  } catch (e) {}

  try {
    const stokRes = await sql`SELECT COUNT(*)::int n, COALESCE(SUM(buy_price),0)::int val FROM perfumes WHERE NOT sold`;
    if (stokRes && stokRes[0]) stok = stokRes[0];
  } catch (e) {}

  try {
    const keuRes = await sql`SELECT
      COALESCE((SELECT SUM(cash_in) FROM sales),0)::int masuk_tunai,
      COALESCE(SUM(CASE WHEN buy_method = 'cash' OR (buy_method = 'spaylater' AND debt_paid) THEN buy_price ELSE 0 END),0)::int pengeluaran_dibayar
      FROM perfumes`;
    if (keuRes && keuRes[0]) keuangan = keuRes[0];
  } catch (e) {}

  try {
    hutang = await sql`SELECT id, name, buy_price, source, due_date, installment_months, paid_installments FROM perfumes
      WHERE buy_method='spaylater' AND NOT debt_paid ORDER BY due_date NULLS LAST`;
  } catch (e) {}

  try {
    bulanan = await sql`SELECT to_char(s.sold_at,'YYYY-MM') bln, COUNT(*)::int n,
      SUM(s.sell_price)::int rev, SUM(s.sell_price - p.buy_price)::int profit
      FROM sales s JOIN perfumes p ON p.id = s.perfume_id GROUP BY 1 ORDER BY 1 DESC`;
  } catch (e) {}

  try {
    kondisi = await sql`SELECT p.kondisi, COUNT(*)::int n, SUM(s.sell_price - p.buy_price)::int profit
      FROM sales s JOIN perfumes p ON p.id = s.perfume_id GROUP BY 1`;
  } catch (e) {}

  try {
    top = await sql`SELECT p.name, (s.sell_price - p.buy_price)::int profit FROM sales s
      JOIN perfumes p ON p.id = s.perfume_id ORDER BY profit DESC LIMIT 3`;
  } catch (e) {}

  try {
    rugi = await sql`SELECT p.name, (s.sell_price - p.buy_price)::int profit FROM sales s
      JOIN perfumes p ON p.id = s.perfume_id WHERE s.sell_price < p.buy_price ORDER BY profit LIMIT 3`;
  } catch (e) {}

  try {
    penjualan = await sql`SELECT p.name, p.kondisi, p.buy_price, s.sell_price,
      (s.sell_price - p.buy_price)::int profit, s.sold_at
      FROM sales s JOIN perfumes p ON p.id = s.perfume_id ORDER BY s.sold_at DESC, s.id DESC LIMIT 10`;
  } catch (e) {}

  try {
    potensiStok = await sql`SELECT name, kondisi, buy_price, target_price
      FROM perfumes WHERE NOT sold ORDER BY id DESC`;
  } catch (e) {}

  const totalModalTerjual = t.modal || 0;
  const totalOmzet = t.rev || 0;
  const marginProfitPct = totalOmzet > 0 ? ((totalOmzet - totalModalTerjual) / totalOmzet) * 100 : 0;

  const profit = totalOmzet - totalModalTerjual;
  const totalHutang = hutang.reduce((a, h) => {
    const totalMonths = h.installment_months || 1;
    const paid = h.paid_installments || 0;
    const remainingMonths = Math.max(0, totalMonths - paid);
    const unpaidAmount = Math.ceil(h.buy_price * (remainingMonths / totalMonths));
    return a + unpaidAmount;
  }, 0);

  const saldoTunai = (keuangan?.masuk_tunai || 0) - (keuangan?.pengeluaran_dibayar || 0);
  const keuanganBersih = saldoTunai - totalHutang;
  const bulanDepan = new Date();
  bulanDepan.setDate(1);
  bulanDepan.setMonth(bulanDepan.getMonth() + 1);
  const tagihanBulanDepan = hutang.flatMap((h) => {
    const tanggalPertama = dateFromDatabase(h.due_date);
    const months = Number(h.installment_months) || 1;
    const paid = Number(h.paid_installments) || 0;
    if (!tanggalPertama || paid >= months) return [];
    return Array.from({ length: months }, (_, index) => {
      if (index < paid) return null; // already paid
      const jatuhTempo = addMonths(tanggalPertama, index);
      if (jatuhTempo.getFullYear() !== bulanDepan.getFullYear() || jatuhTempo.getMonth() !== bulanDepan.getMonth()) return null;
      return { ...h, jatuhTempo, cicilanKe: index + 1, nominal: installmentAmount(Number(h.buy_price), months, index) };
    }).filter(Boolean);
  });
  const totalTagihanBulanDepan = tagihanBulanDepan.reduce((total, tagihan) => total + tagihan.nominal, 0);
  const namaBulanDepan = bulanDepan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const totalPotensi = potensiStok.reduce((total, p) => p.target_price == null ? total : total + p.target_price - p.buy_price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Dashboard Keuangan &amp; Stok
        </h1>
        <div className="flex gap-3">
          <a className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm" href="/stok">
            <PlusCircle size={18} /> Tambah Stok
          </a>
          <a className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm" href="/jual">
            <ShoppingCart size={18} /> Catat Penjualan
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Wallet size={14} /> Keuangan Bersih
          </span>
          <strong className={`text-2xl font-extrabold tracking-tight ${keuanganBersih < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {rp(keuanganBersih)}
          </strong>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <DollarSign size={14} /> Uang Masuk Penjualan
          </span>
          <strong className="text-2xl font-extrabold tracking-tight text-slate-900">
            {rp(keuangan?.masuk_tunai)}
          </strong>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Package size={14} /> Nilai Aset Stok ({stok?.n || 0} botol)
          </span>
          <strong className="text-2xl font-extrabold tracking-tight text-slate-900">
            {rp(stok?.val)}
          </strong>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <CreditCard size={14} /> Hutang PayLater Aktif
          </span>
          <strong className={`text-2xl font-extrabold tracking-tight ${totalHutang ? 'text-red-600' : 'text-slate-900'}`}>
            {rp(totalHutang)}
          </strong>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Calendar size={14} /> Tagihan {namaBulanDepan}
          </span>
          <strong className={`text-2xl font-extrabold tracking-tight ${totalTagihanBulanDepan ? 'text-red-600' : 'text-slate-900'}`}>
            {rp(totalTagihanBulanDepan)}
          </strong>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <TrendingUp size={14} /> Potensi Laba Stok
          </span>
          <strong className={`text-2xl font-extrabold tracking-tight ${totalPotensi < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {rp(totalPotensi)}
          </strong>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <DollarSign size={14} /> Profit Penjualan ({t?.n || 0} terjual)
          </span>
          <strong className={`text-2xl font-extrabold tracking-tight ${profit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {rp(profit)}
          </strong>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Percent size={14} /> Margin Profit Penjualan
          </span>
          <strong className={`text-2xl font-extrabold tracking-tight ${marginProfitPct < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {marginProfitPct.toFixed(1)}%
          </strong>
        </div>
      </div>

      <MonthlyChart data={bulanan} />

      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          <Calendar size={20} /> Tagihan &amp; Cicilan Bulan Depan ({namaBulanDepan})
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Parfum</th>
                  <th className="px-6 py-4">Cicilan ke</th>
                  <th className="px-6 py-4">Jatuh tempo</th>
                  <th className="px-6 py-4">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tagihanBulanDepan.map((tagihan) => (
                  <tr key={`${tagihan.id}-${tagihan.cicilanKe}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{tagihan.name}</td>
                    <td className="px-6 py-4">{tagihan.cicilanKe}/{tagihan.installment_months || 1}</td>
                    <td className="px-6 py-4">{tagihan.jatuhTempo.toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{rp(tagihan.nominal)}</td>
                  </tr>
                ))}
                {!tagihanBulanDepan.length && (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Tidak ada tagihan terjadwal bulan depan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          <CreditCard size={20} /> Daftar Hutang ShopeePayLater
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Parfum</th>
                  <th className="px-6 py-4">Sumber</th>
                  <th className="px-6 py-4">Jatuh tempo</th>
                  <th className="px-6 py-4">Cicilan Dibayar</th>
                  <th className="px-6 py-4">Jumlah Total</th>
                  <th className="px-6 py-4">Aksi Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hutang.map((h) => {
                  const totalM = h.installment_months || 1;
                  const paidM = h.paid_installments || 0;
                  return (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{h.name}</td>
                      <td className="px-6 py-4">{h.source || '-'}</td>
                      <td className="px-6 py-4">{h.due_date ? new Date(h.due_date).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {paidM} / {totalM} bln lunas
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{rp(h.buy_price)}</td>
                      <td className="px-6 py-4">
                        <PayDebtButton action={payDebt} id={h.id} name={h.name} paid={paidM} total={totalM} />
                      </td>
                    </tr>
                  );
                })}
                {!hutang.length && (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Tidak ada hutang aktif.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          <TrendingUp size={20} /> Riwayat Penjualan &amp; Margin Terakhir
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Parfum</th>
                  <th className="px-6 py-4">Kondisi</th>
                  <th className="px-6 py-4">Modal</th>
                  <th className="px-6 py-4">Nilai Jual</th>
                  <th className="px-6 py-4">Profit</th>
                  <th className="px-6 py-4">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {penjualan.map((p, i) => {
                  const mg = p.sell_price > 0 ? ((p.profit / p.sell_price) * 100).toFixed(1) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                      <td className="px-6 py-4">{kondisiLabel(p.kondisi)}</td>
                      <td className="px-6 py-4">{rp(p.buy_price)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{rp(p.sell_price)}</td>
                      <td className={`px-6 py-4 font-bold ${p.profit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{rp(p.profit)}</td>
                      <td className={`px-6 py-4 font-bold ${Number(mg) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{mg}%</td>
                    </tr>
                  );
                })}
                {!penjualan.length && (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Belum ada penjualan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          <Tag size={20} /> Target Jual &amp; Potensi Keuntungan Stok
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Parfum</th>
                  <th className="px-6 py-4">Kondisi</th>
                  <th className="px-6 py-4">Modal</th>
                  <th className="px-6 py-4">Minimal agar untung</th>
                  <th className="px-6 py-4">Target Jual</th>
                  <th className="px-6 py-4">Potensi Untung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {potensiStok.map((p, i) => {
                  const potensi = p.target_price == null ? null : p.target_price - p.buy_price;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                      <td className="px-6 py-4">{kondisiLabel(p.kondisi)}</td>
                      <td className="px-6 py-4">{rp(p.buy_price)}</td>
                      <td className="px-6 py-4">{rp(p.buy_price + 1)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{p.target_price == null ? 'Belum diisi' : rp(p.target_price)}</td>
                      <td className={`px-6 py-4 font-bold ${potensi != null && potensi < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{potensi == null ? '-' : rp(potensi)}</td>
                    </tr>
                  );
                })}
                {!potensiStok.length && (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Tidak ada stok aktif.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
            <BarChart2 size={20} /> Analisis per Bulan
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Bulan</th>
                    <th className="px-6 py-4">Terjual</th>
                    <th className="px-6 py-4">Omzet</th>
                    <th className="px-6 py-4">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bulanan.map((b) => (
                    <tr key={b.bln} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{b.bln}</td>
                      <td className="px-6 py-4">{b.n} botol</td>
                      <td className="px-6 py-4">{rp(b.rev)}</td>
                      <td className={`px-6 py-4 font-bold ${b.profit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{rp(b.profit)}</td>
                    </tr>
                  ))}
                  {!bulanan.length && (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Belum ada data bulanan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2><Tag size={18} /> Analisis Berdasarkan Kondisi</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Kondisi</th>
                    <th className="px-6 py-4">Terjual</th>
                    <th className="px-6 py-4">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kondisi.map((k) => (
                    <tr key={k.kondisi} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{kondisiLabel(k.kondisi)}</td>
                      <td className="px-6 py-4">{k.n} botol</td>
                      <td className={`px-6 py-4 font-bold ${k.profit < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{rp(k.profit)}</td>
                    </tr>
                  ))}
                  {!kondisi.length && (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">Belum ada data kondisi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
          <Award size={20} /> Parfum Paling Untung &amp; Paling Rugi
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Parfum</th>
                  <th className="px-6 py-4">Keterangan Profit / Rugi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top.map((x, i) => (
                  <tr key={'t' + i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{x.name}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">+{rp(x.profit)} (Paling Untung)</td>
                  </tr>
                ))}
                {rugi.map((x, i) => (
                  <tr key={'r' + i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{x.name}</td>
                    <td className="px-6 py-4 font-bold text-red-600">{rp(x.profit)} (Rugi)</td>
                  </tr>
                ))}
                {!top.length && !rugi.length && (
                  <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400">Belum ada data profit/rugi parfum.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
