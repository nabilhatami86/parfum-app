'use client';

import { useState } from 'react';
import { useToast } from './Toast';

export function ActionButton({ action, children, className = '', successMessage = 'Berhasil disimpan', ...props }) {
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await action(formData);
      showToast(successMessage, 'success');
      form.reset();
    } catch (err) {
      showToast(err.message || 'Terjadi kesalahan', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'inline', margin: 0 }}>
      {props.childrenFields}
      <button className={className} {...props}>{children}</button>
    </form>
  );
}

export function DeleteButton({ action, id, name = 'item' }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm(`Yakin ingin menghapus ${name}?`)) return;
    
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('id', id);
      await action(fd);
      showToast(`Berhasil menghapus ${name}`, 'success');
    } catch (err) {
      showToast('Gagal menghapus: ' + (err.message || ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDelete} style={{ display: 'inline', margin: 0 }}>
      <button className="danger" type="submit" disabled={loading}>
        {loading ? 'Menghapus...' : 'Hapus'}
      </button>
    </form>
  );
}
