'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        isActive 
          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
      }`}
    >
      {children}
    </Link>
  );
}
