import './globals.css';
import { ToastProvider } from '@/app/components/Toast';
import NavLink from '@/app/components/NavLink';
import { Sparkles } from 'lucide-react';

export const metadata = { title: 'Buku Parfum - Manajemen Stok & Penjualan' };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full bg-slate-50">
      <body className="h-full font-sans antialiased text-slate-900 flex flex-col min-h-screen">
        <ToastProvider>
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Buku Parfum
              </span>
            </div>
            <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/stok">Stok Parfum</NavLink>
              <NavLink href="/jual">Catat Penjualan</NavLink>
            </nav>
          </header>
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
            Buku Parfum Management System &copy; 2026
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
