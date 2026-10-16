import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql, init } from '@/lib/db';
import { updatePerfume } from '@/app/actions';
import EditPerfumeForm from '@/app/components/EditPerfumeForm';

export const dynamic = 'force-dynamic';

export default async function EditStok({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const perfumeId = Number(id);
  if (!Number.isInteger(perfumeId) || perfumeId < 1) notFound();

  await init();
  const rows = await sql`SELECT * FROM perfumes WHERE id = ${perfumeId}`;
  if (!rows || rows.length === 0) notFound();
  const p = rows[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Edit Parfum</h1>
      <EditPerfumeForm action={updatePerfume} perfume={p} />
    </div>
  );
}
