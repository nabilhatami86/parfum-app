'use client';

import { useState } from 'react';

export default function PaymentMethodFields({ defaultMethod = 'cash', defaultMonths = 1, defaultDueDate = '', allowTradeIn = false }) {
  const [method, setMethod] = useState(defaultMethod);

  return (
    <>
      <label>Dibeli pakai
        <select name="buy_method" value={method} onChange={(event) => setMethod(event.target.value)}>
          <option value="cash">Cash</option>
          <option value="spaylater">ShopeePayLater</option>
          {allowTradeIn && <option value="tukar_tambah">Tukar tambah</option>}
        </select>
      </label>
      {method === 'spaylater' && <>
        <label>Durasi cicilan
          <select name="installment_months" defaultValue={String(defaultMonths)}>
            <option value="1">1 bulan</option>
            <option value="3">3 bulan</option>
            <option value="6">6 bulan</option>
            <option value="12">12 bulan</option>
          </select>
        </label>
        <label>Tanggal cicilan pertama
          <input name="due_date" type="date" defaultValue={defaultDueDate} required />
        </label>
      </>}
    </>
  );
}
