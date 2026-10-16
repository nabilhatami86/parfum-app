'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/Toast';

export default function ClientTabs({ initialTab = 'dashboard', dashboardContent, stokContent, jualContent }) {
  const [tab, setTab] = useState(initialTab);
  const showToast = useToast();

  return (
    <div>
      <div className="tab-bar">
        <button 
          className={`tab-btn ${tab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-btn ${tab === 'stok' ? 'active' : ''}`}
          onClick={() => setTab('stok')}
        >
          📦 Stok Parfum
        </button>
        <button 
          className={`tab-btn ${tab === 'jual' ? 'active' : ''}`}
          onClick={() => setTab('jual')}
        >
          💰 Catat Penjualan
        </button>
      </div>

      <div className="tab-content" style={{ display: tab === 'dashboard' ? 'block' : 'none' }}>
        {dashboardContent}
      </div>
      <div className="tab-content" style={{ display: tab === 'stok' ? 'block' : 'none' }}>
        {stokContent}
      </div>
      <div className="tab-content" style={{ display: tab === 'jual' ? 'block' : 'none' }}>
        {jualContent}
      </div>
    </div>
  );
}
