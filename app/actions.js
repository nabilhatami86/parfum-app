'use server';
import { sql, init } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addPerfume(fd) {
  await init();
  const method = fd.get('buy_method');
  const installmentMonths = method === 'spaylater' && [1, 3, 6, 12].includes(+fd.get('installment_months'))
    ? +fd.get('installment_months') : 1;
  await sql`INSERT INTO perfumes (name, notes, kondisi, buy_price, target_price, buy_method, source, due_date, debt_paid, bought_at, installment_months)
    VALUES (${fd.get('name')}, ${fd.get('notes')}, ${fd.get('kondisi')}, ${+fd.get('buy_price')}, ${fd.get('target_price') ? +fd.get('target_price') : null},
            ${method}, ${fd.get('source')}, ${fd.get('due_date') || null}, ${method !== 'spaylater'},
            ${fd.get('bought_at') || new Date().toISOString().slice(0, 10)}, ${installmentMonths})`;
  revalidatePath('/'); revalidatePath('/stok');
}

export async function updatePerfume(fd) {
  await init();
  const method = fd.get('buy_method');
  const installmentMonths = method === 'spaylater' && [1, 3, 6, 12].includes(+fd.get('installment_months'))
    ? +fd.get('installment_months') : 1;
  const debtPaid = method !== 'spaylater' || fd.get('was_debt_paid') === 'true';
  await sql`UPDATE perfumes
    SET name = ${fd.get('name')},
        notes = ${fd.get('notes')},
        kondisi = ${fd.get('kondisi')},
        buy_price = ${+fd.get('buy_price')},
        target_price = ${fd.get('target_price') ? +fd.get('target_price') : null},
        buy_method = ${method},
        source = ${fd.get('source')},
        due_date = ${fd.get('due_date') || null},
        debt_paid = ${debtPaid},
        bought_at = ${fd.get('bought_at')},
        installment_months = ${installmentMonths}
    WHERE id = ${+fd.get('id')}`;
  revalidatePath('/'); revalidatePath('/stok');
  redirect('/stok');
}

export async function deletePerfume(fd) {
  await init();
  // Parfum yang sudah terjual tetap disimpan agar riwayat penjualan konsisten.
  await sql`DELETE FROM perfumes WHERE id = ${+fd.get('id')} AND NOT sold`;
  revalidatePath('/'); revalidatePath('/stok');
}

export async function markAsTester(fd) {
  await init();
  await sql`UPDATE perfumes SET kondisi = 'tester' WHERE id = ${+fd.get('id')} AND NOT sold`;
  revalidatePath('/'); revalidatePath('/stok');
}

export async function sellPerfume(fd) {
  await init();
  const cash = +fd.get('cash_in') || 0;
  let tiId = null, tiValue = 0;
  if (fd.get('ti_name')) {
    tiValue = +fd.get('ti_value') || 0;
    const [r] = await sql`INSERT INTO perfumes (name, notes, kondisi, buy_price, buy_method, source)
      VALUES (${fd.get('ti_name')}, ${fd.get('ti_notes') || ''}, ${fd.get('ti_kondisi')}, ${tiValue}, 'tukar_tambah',
              ${'TT dari ' + (fd.get('customer') || '-')}) RETURNING id`;
    tiId = r.id;
  }
  const pid = +fd.get('perfume_id');
  await sql`INSERT INTO sales (perfume_id, sell_price, cash_in, trade_in_id, customer)
    VALUES (${pid}, ${cash + tiValue}, ${cash}, ${tiId}, ${fd.get('customer')})`;
  await sql`UPDATE perfumes SET sold = TRUE WHERE id = ${pid}`;
  revalidatePath('/'); revalidatePath('/stok');
  redirect('/');
}

export async function payDebt(fd) {
  await init();
  const id = +fd.get('id');
  const [p] = await sql`SELECT installment_months, paid_installments FROM perfumes WHERE id = ${id}`;
  if (p) {
    const total = p.installment_months || 1;
    const currentPaid = p.paid_installments || 0;
    const nextPaid = Math.min(currentPaid + 1, total);
    const isPaid = nextPaid >= total;
    await sql`UPDATE perfumes SET paid_installments = ${nextPaid}, debt_paid = ${isPaid} WHERE id = ${id}`;
  }
  revalidatePath('/');
}
