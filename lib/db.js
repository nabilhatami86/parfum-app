import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

let ready;
export function init() {
  return (ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS perfumes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      notes TEXT DEFAULT '',
      kondisi TEXT NOT NULL,
      buy_price INT NOT NULL,
      buy_method TEXT NOT NULL,
      source TEXT DEFAULT '',
      due_date DATE,
      debt_paid BOOLEAN NOT NULL DEFAULT TRUE,
      bought_at DATE NOT NULL DEFAULT CURRENT_DATE,
      sold BOOLEAN NOT NULL DEFAULT FALSE
    )`;
    await sql`ALTER TABLE perfumes
      ADD COLUMN IF NOT EXISTS installment_months INT NOT NULL DEFAULT 1`;
    await sql`ALTER TABLE perfumes
      ADD COLUMN IF NOT EXISTS target_price INT`;
    await sql`ALTER TABLE perfumes
      ADD COLUMN IF NOT EXISTS paid_installments INT NOT NULL DEFAULT 0`;
    await sql`CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      perfume_id INT NOT NULL REFERENCES perfumes(id),
      sell_price INT NOT NULL,
      cash_in INT NOT NULL,
      trade_in_id INT REFERENCES perfumes(id),
      customer TEXT DEFAULT '',
      sold_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;
  })());
}

export const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
export const kondisiLabel = (kondisi) => ({
  segel: 'Segel',
  tester: 'Dibuka untuk tes aroma',
  preloved: 'Preloved',
}[kondisi] || kondisi);
