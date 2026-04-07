// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/queryClient.js';

export function PaymentsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPageNum] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['gig', 'user_skills', page, search],
    queryFn: () => apiFetch<any>(`/api/gig/user_skills?page=${page}&limit=20${search ? `&q=${search}` : ''}`),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => apiFetch<any>('/api/gig/user_skills', { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gig', 'user_skills'] });
      setForm({ name: '', description: '', status: 'active' });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof form }) =>
      apiFetch<any>(`/api/gig/user_skills/${id}`, { method: 'PUT', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gig', 'user_skills'] });
      setEditId(null);
      setForm({ name: '', description: '', status: 'active' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/gig/user_skills/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gig', 'user_skills'] }),
  });

  const items = data?.data || [];
  const pagination = data?.pagination;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate({ id: editId, body: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (item: any) => {
    setEditId(item.id);
    setForm({ name: item.name || '', description: item.description || '', status: item.status || 'active' });
    setShowForm(true);
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Contract Management</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', status: 'active' }); }}
          className="btn-primary">
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="section-title">{editId ? 'Edit Entry' : 'Create New'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}) )}
                placeholder="Enter name" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}) )}
                placeholder="Enter description" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}) )}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}>
                {editId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input className="input max-w-sm" placeholder="Search user skills..."
          value={search} onChange={e => { setSearch(e.target.value); setPageNum(1); }} />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">No user skills found</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Add First Entry</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td className="font-mono text-xs text-gray-500">{item.id}</td>
                  <td className="font-medium text-gray-200">{item.name || '—'}</td>
                  <td className="text-gray-400 max-w-xs truncate">{item.description || '—'}</td>
                  <td>
                    <span className={`badge ${
                      item.status === 'active' ? 'badge-success' :
                      item.status === 'pending' ? 'badge-warning' :
                      item.status === 'archived' ? 'badge-info' : 'badge-error'
                    }`}>{item.status || 'active'}</span>
                  </td>
                  <td className="text-gray-500 text-xs">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(item)}
                        className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 hover:bg-blue-900/20 rounded">
                        Edit
                      </button>
                      <button onClick={() => deleteMutation.mutate(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 hover:bg-red-900/20 rounded">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary text-sm py-1 px-3 disabled:opacity-50">Prev</button>
            <button onClick={() => setPageNum(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages} className="btn-secondary text-sm py-1 px-3 disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
