'use client';

export default function MonthlyChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">Belum ada data grafik bulanan.</div>;
  }

  const sorted = [...data].reverse();
  const maxVal = Math.max(...sorted.map(d => Math.max(Math.abs(d.profit), Math.abs(d.rev))), 100000);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-10">
      <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
        Grafik Performa Bulanan (Profit &amp; Omzet)
      </h3>
      
      <div className="relative h-64 w-full flex items-end gap-3 sm:gap-6 pt-8 pb-6 px-2 border-b-2 border-slate-100 overflow-x-auto">
        {/* Zero baseline */}
        <div className="absolute left-0 right-0 bottom-14 border-t border-dashed border-slate-200 pointer-events-none"></div>

        {sorted.map((item) => {
          const profitHeight = Math.round((Math.abs(item.profit) / maxVal) * 160);
          const revHeight = Math.round((Math.abs(item.rev) / maxVal) * 160);
          const isNeg = item.profit < 0;

          return (
            <div className="flex flex-col items-center flex-1 min-w-[70px] h-full justify-end group relative" key={item.bln}>
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-20">
                {item.bln} | Omzet: Rp {item.rev.toLocaleString('id-ID')} | Profit: Rp {item.profit.toLocaleString('id-ID')}
              </div>

              {/* Value indicator on top */}
              <div className="mb-2 text-center whitespace-nowrap">
                <span className={`text-xs font-extrabold ${isNeg ? 'text-red-600' : 'text-emerald-600'}`}>
                  Rp {(item.profit / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Bar container: Omzet (Indigo background line/bar) & Profit (Green/Red bar going up/down) */}
              <div className="w-full max-w-[48px] h-44 flex items-end justify-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                {/* Omzet bar */}
                <div 
                  className="w-1/2 bg-indigo-500/80 rounded-t-lg transition-all duration-500 hover:bg-indigo-600"
                  style={{ height: `${Math.max(revHeight, 8)}px` }}
                  title={`Omzet: Rp ${item.rev.toLocaleString('id-ID')}`}
                />
                {/* Profit bar: Hijau ke atas jika untung, Merah ke atas jika rugi */}
                <div 
                  className={`w-1/2 rounded-t-lg transition-all duration-500 shadow-sm ${
                    isNeg 
                      ? 'bg-gradient-to-t from-red-600 to-red-500 shadow-red-200' 
                      : 'bg-gradient-to-t from-emerald-600 to-emerald-500 shadow-emerald-200'
                  }`}
                  style={{ height: `${Math.max(profitHeight, 8)}px` }}
                  title={`Profit: Rp ${item.profit.toLocaleString('id-ID')}`}
                />
              </div>

              <div className="mt-3 text-xs font-bold text-slate-600">{item.bln}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-6 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-indigo-500 rounded-md"></span> Omzet Penjualan
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-emerald-600 rounded-md"></span> Profit Positif (Untung)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-red-600 rounded-md"></span> Profit Negatif (Rugi)
        </span>
      </div>
    </div>
  );
}
